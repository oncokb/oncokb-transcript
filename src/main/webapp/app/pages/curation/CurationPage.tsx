import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Button, Col, Container, Input, InputGroup, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import { ViewportList } from 'react-viewport-list';
import { IRootStore } from 'app/stores';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import {
  CBIOPORTAL,
  CHECKBOX_LABEL_LEFT_MARGIN,
  COSMIC,
  GET_ALL_DRUGS_PAGE_SIZE,
  PAGE_ROUTE,
  PENETRANCE,
  RADIO_OPTION_NONE,
} from 'app/config/constants/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider } from 'app/shared/links/PubmedGeneArticlesLink';
import { getSectionClassName, getUserFullName } from 'app/shared/util/utils';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import { compareMutations, geneNeedsReview, getFirebasePath, getMutationName } from 'app/shared/util/firebase/firebase-utils';
import styles from './styles.module.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { Comment, HistoryRecord, Mutation } from 'app/shared/model/firebase/firebase.model';
import {
  FDA_LEVEL_KEYS,
  GENE_TYPE,
  GENE_TYPE_KEY,
  MUTATION_EFFECT_OPTIONS,
  ONCOGENICITY_OPTIONS,
  TX_LEVEL_OPTIONS,
} from 'app/config/constants/firebase';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import VusTable from '../../shared/table/VusTable';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import Tabs from 'app/components/tabs/tabs';
import CurationHistoryTab from 'app/components/tabs/CurationHistoryTab';
import { FaFilter } from 'react-icons/fa';
import _ from 'lodash';
import MutationCollapsible from './collapsible/MutationCollapsible';
import { IDrug } from 'app/shared/model/drug.model';
import { IGene } from 'app/shared/model/gene.model';
import CurationToolsTab from 'app/components/tabs/CurationToolsTab';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { HgncLink } from 'app/shared/links/HgncLink';
import ReviewPage from './review/ReviewPage';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import AddMutationButton from './button/AddMutationButton';
import RelevantCancerTypesModal from 'app/shared/modal/RelevantCancerTypesModal';
import { UncuratedGeneAlert } from 'app/shared/alert/UncuratedGeneAlert';
import GeneTranscriptInfoInput from 'app/shared/firebase/input/GeneTranscriptInfoInput';
import { FdaLevelIcon } from 'app/shared/icons/FdaLevelIcon';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export type ParsedHistoryRecord = { record: HistoryRecord; timestamp: number; admin: string };

export type FirebaseMutation = Mutation & {
  firebaseIndex: number;
};

const CurationPage = (props: ICurationPageProps) => {
  const history = useHistory();
  const hugoSymbol = props.match.params.hugoSymbol.toUpperCase();
  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const firebaseHistoryPath = getFirebasePath('HISTORY', hugoSymbol);
  const firebaseMetaPath = getFirebasePath('META_GENE', hugoSymbol);
  const firebaseVusPath = getFirebasePath('VUS', hugoSymbol);

  const [isReviewing, setIsReviewing] = useState(false);
  const [isReviewFinished, setIsReviewFinished] = useState(false);

  const [showAddMutationModal, setShowAddMutationModal] = useState(false);
  const [mutationFilter, setMutationFilter] = useState('');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [allMutations, setAllMutations] = useState<FirebaseMutation[]>(null);
  const [mutations, setMutations] = useState<FirebaseMutation[]>([]);

  const [oncogenicityFilter, setOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
  const [tempOncogenicityFilter, setTempOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));

  const [mutationEffectFilter, setMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
  const [tempMutationEffectFilter, setTempMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));

  const [txLevelFilter, setTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));
  const [tempTxLevelFilter, setTempTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));

  const [enabledCheckboxes, setEnabledCheckboxes] = useState<string[]>([]);

  const [openMutationCollapsible, setOpenMutationCollapsible] = useState<Mutation>(null);
  const [mutationCollapsibleScrollIndex, setMutationCollapsibleScrollIndex] = useState(0);

  function initFilterCheckboxState(options: string[]) {
    return options.map(option => ({ label: option, selected: false, disabled: false }));
  }

  const isGeneCurated = useMemo(() => {
    if (props.metaListData) {
      return Object.keys(props.metaListData).includes(hugoSymbol);
    }
    return true;
  }, [props.metaListData]);

  const mutationsAreFiltered = useMemo(() => {
    return (
      oncogenicityFilter.some(filter => filter.selected) ||
      mutationEffectFilter.some(filter => filter.selected) ||
      txLevelFilter.some(filter => filter.selected) ||
      mutationFilter
    );
  }, [oncogenicityFilter, mutationEffectFilter, txLevelFilter, mutationFilter]);

  const showFilterModalCancelButton = useMemo(() => {
    return (
      tempOncogenicityFilter.some(filter => filter.selected) ||
      tempMutationEffectFilter.some(filter => filter.selected) ||
      tempTxLevelFilter.some(filter => filter.selected)
    );
  }, [tempOncogenicityFilter, tempMutationEffectFilter, tempTxLevelFilter]);

  function handleToggleFilterModal() {
    setShowFilterModal(showModal => !showModal);
  }

  function handleFilterCheckboxChange(
    index: number,
    setState: React.Dispatch<
      React.SetStateAction<
        {
          label: string;
          selected: boolean;
        }[]
      >
    >
  ) {
    setState(currentState =>
      currentState.map((filter, filterIndex) => {
        if (index === filterIndex) {
          return { label: filter.label, selected: !filter.selected };
        }
        return filter;
      })
    );
  }

  async function handleCreateComment(path: string, content: string, currentCommentsLength: number) {
    // replace with runTransaction?
    const newComment = new Comment();
    newComment.content = content;
    newComment.email = props.account.email;
    newComment.resolved = 'false';
    newComment.userName = getUserFullName(props.account);

    try {
      await props.handleFirebaseUpdateUntemplated(path, [...Array(currentCommentsLength).fill({}), newComment]);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDeleteComments(path: string, indices: number[]) {
    try {
      await props.handleFirebaseDeleteFromArray(path, indices);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleResolveComment(path: string) {
    try {
      await props.handleFirebaseUpdateUntemplated(path, { resolved: true });
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleUnresolveComment(path: string) {
    try {
      await props.handleFirebaseUpdateUntemplated(path, { resolved: false });
    } catch (error) {
      notifyError(error);
    }
  }

  useEffect(() => {
    if (props.firebaseInitSuccess) {
      const cleanupCallbacks = [];
      props.searchGeneEntities({ query: hugoSymbol, exact: true });
      cleanupCallbacks.push(props.addListener(firebaseGenePath));
      cleanupCallbacks.push(props.addVusListener(firebaseVusPath));
      cleanupCallbacks.push(props.addHistoryListener(firebaseHistoryPath));
      cleanupCallbacks.push(props.addMetaListener(firebaseMetaPath));
      cleanupCallbacks.push(props.addMetaListListener());
      cleanupCallbacks.push(() => props.updateCollaborator(hugoSymbol, false));
      cleanupCallbacks.push(props.addMetaCollaboratorsListener());
      return () => {
        cleanupCallbacks.forEach(callback => callback && callback());
      };
    }
  }, [props.firebaseInitSuccess]);

  useEffect(() => {
    if (props.metaData) {
      const currentReviewer = props.metaData?.review?.currentReviewer;
      setIsReviewing(currentReviewer?.toLowerCase() === props.fullName.toLowerCase());
    }
  }, [props.metaData]);

  const geneEntity: IGene | undefined = useMemo(() => {
    return props.geneEntities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.geneEntities]);

  useEffect(() => {
    if (props.metaCollaboratorsData && props.data?.name) {
      props.updateCollaborator(hugoSymbol, true).catch(error => {
        notifyError(error);
        history.push(PAGE_ROUTE.CURATION);
      });
    }
  }, [props.metaCollaboratorsData, props.data]);

  useEffect(() => {
    if (props.data?.mutations && props.mutationSummaryStats) {
      const fetchedMutations: FirebaseMutation[] = _.cloneDeep(props.data.mutations).map((mutation, firebaseIndex) => ({
        ...mutation,
        firebaseIndex,
      }));
      if (!allMutations) {
        // has not yet been sorted
        // setAllMutations(fetchedMutations.sort((mut1, mut2) => compareMutations(mut1, mut2, props.mutationSummaryStats)));
      } else {
        const fetchedMutationUuidToMutation: { [uuid: string]: FirebaseMutation } = {};
        for (const fetchedMutation of fetchedMutations) {
          fetchedMutationUuidToMutation[fetchedMutation.name_uuid] = fetchedMutation;
        }

        setAllMutations(currentMutations => {
          const newMutations: FirebaseMutation[] = [];
          for (const currentMutation of currentMutations) {
            const fetchedMutation = fetchedMutationUuidToMutation[currentMutation.name_uuid];
            if (fetchedMutation) {
              newMutations.push(fetchedMutation);
              delete fetchedMutationUuidToMutation[currentMutation.name_uuid];
            }
          }

          return [...Object.values(fetchedMutationUuidToMutation), ...newMutations];
        });
      }
    }
  }, [props.data, props.mutationSummaryStats]);

  useEffect(() => {
    filterMutations();
  }, [allMutations, mutationFilter, oncogenicityFilter, mutationEffectFilter, txLevelFilter]);

  useEffect(() => {
    if (props.mutationSummaryStats) {
      const allMutationSummaries = Object.values(props.mutationSummaryStats);

      const allOncogenicities = new Set(allMutationSummaries.map(summary => summary.oncogenicity));
      const allMutationEffects = new Set(allMutationSummaries.map(summary => summary.mutationEffect));
      const allTxLevels = new Set(_.flatten(allMutationSummaries.map(summary => Object.keys(summary.txLevels))));

      setEnabledCheckboxes([...allOncogenicities, ...allMutationEffects, ...allTxLevels]);
    }
  }, [props.mutationSummaryStats]);

  useEffect(() => {
    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
  }, []);

  const parsedHistoryList = useMemo(() => {
    if (!props.historyData) {
      return;
    }

    const newList = new Map<string, ParsedHistoryRecord[]>();

    for (const historyData of Object.values(props.historyData)) {
      try {
        for (const record of historyData.records) {
          if (!newList.has(record.location)) {
            newList.set(record.location, []);
          }
          newList.get(record.location).push({ record, timestamp: historyData.timeStamp, admin: historyData.admin });
        }
      } catch {
        continue;
      }
    }

    return newList;
  }, [props.historyData]);

  function filterMutations() {
    setMutations(
      (allMutations || []).reduce<FirebaseMutation[]>((filteredMutations, mutation) => {
        const matchesName =
          !mutationFilter || getMutationName(mutation.name, mutation.alterations).toLowerCase().includes(mutationFilter.toLowerCase());

        const selectedOncogenicities = oncogenicityFilter.filter(filter => filter.selected);
        const matchesOncogenicity =
          selectedOncogenicities.length === 0 ||
          selectedOncogenicities.some(oncogenicity => oncogenicity.label === mutation.mutation_effect.oncogenic);

        const selectedMutationEffects = mutationEffectFilter.filter(filter => filter.selected);
        const matchesMutationEffect =
          selectedMutationEffects.length === 0 ||
          selectedMutationEffects.some(mutationEffect => mutationEffect.label === mutation.mutation_effect.effect);

        function matchesTxLevel() {
          const selectedTxLevels = txLevelFilter.filter(txLevel => txLevel.selected);
          if (selectedTxLevels.length === 0) {
            return true;
          }

          if (!mutation.tumors) {
            return false;
          }

          for (const tumor of mutation.tumors) {
            for (const TI of tumor.TIs) {
              if (!TI.treatments) {
                continue;
              }

              for (const treatment of TI.treatments) {
                if (selectedTxLevels.some(txLevel => txLevel.label === treatment.level)) {
                  return true;
                }
              }
            }
          }
          return false;
        }

        if (matchesName && matchesOncogenicity && matchesMutationEffect && matchesTxLevel()) {
          return [...filteredMutations, mutation];
        }

        return filteredMutations;
      }, []) || []
    );
  }
  const handleReviewButtonClick = () => {
    if (isReviewing) {
      setIsReviewFinished(false);
    }
    props.updateMeta(`${firebaseMetaPath}`, { review: { currentReviewer: isReviewing ? '' : props.fullName } });
  };

  const handleReviewFinished = (isFinished: boolean) => {
    setIsReviewFinished(isFinished);
  };

  const getReviewButtons = () => {
    let button;
    if (geneNeedsReview(props.metaData)) {
      if (isReviewing || isReviewFinished) {
        button = (
          <Button color="primary" onClick={handleReviewButtonClick}>
            Review Complete
          </Button>
        );
      } else {
        button = (
          <Button outline color="primary" onClick={handleReviewButtonClick}>
            Review
          </Button>
        );
      }
    } else {
      if (isReviewFinished) {
        button = (
          <Button color="primary" onClick={handleReviewButtonClick}>
            Review Complete
          </Button>
        );
      } else {
        return undefined;
      }
    }
    return <>{button}</>;
  };

  const mutationScrollContainerRef = useRef<HTMLDivElement>(null);

  function getMutationCollapsibles() {
    if (openMutationCollapsible) {
      const mutation = mutations.find(mut => mut.name_uuid === openMutationCollapsible.name_uuid);
      return (
        <Row style={{ transition: 'height 0.5s, opacity 0.5s' }} className={'mb-2'}>
          <Col>
            <MutationCollapsible
              open
              onToggle={() => {
                setOpenMutationCollapsible(null);
              }}
              mutationList={props.data.mutations}
              vusList={props.vusData}
              mutation={mutation}
              firebaseIndex={mutation.firebaseIndex}
              parsedHistoryList={parsedHistoryList}
              drugList={props.drugList}
            />
          </Col>
        </Row>
      );
    }

    return (
      <div style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'hidden' }} ref={mutationScrollContainerRef}>
        <ViewportList
          viewportRef={mutationScrollContainerRef}
          items={mutations}
          initialIndex={mutationCollapsibleScrollIndex}
          initialPrerender={10}
        >
          {(mutation, index) => (
            <Row key={mutation.firebaseIndex} className={'mb-2'}>
              <Col>
                <MutationCollapsible
                  onToggle={() => {
                    setOpenMutationCollapsible(mutation);
                    setMutationCollapsibleScrollIndex(index);
                  }}
                  mutationList={props.data?.mutations}
                  vusList={props.vusData}
                  mutation={mutation}
                  firebaseIndex={mutation.firebaseIndex}
                  parsedHistoryList={parsedHistoryList}
                  drugList={props.drugList}
                />
              </Col>
            </Row>
          )}
        </ViewportList>
      </div>
    );
  }

  if (!isGeneCurated) {
    return <UncuratedGeneAlert />;
  }

  return <></>;

  // return !!props.data && props.vusData !== undefined && props.drugList.length > 0 && !props.loadingGenes ? (
  //   <>
  //     <div>
  //       <Row className={'mb-2'}>
  //         <Col className={'d-flex justify-content-between flex-row flex-nowrap align-items-end'}>
  //           <div className="d-flex align-items-end all-children-margin">
  //             <span style={{ fontSize: '3rem', lineHeight: 1 }} className={'mr-2'}>
  //               {props.data.name}
  //             </span>
  //             {!isReviewing && (
  //               <>
  //                 <CommentIcon
  //                   id={`${hugoSymbol}_curation_page`}
  //                   comments={props.data.name_comments || []}
  //                   onCreateComment={content =>
  //                     handleCreateComment(`${firebaseGenePath}/name_comments`, content, props.data.name_comments?.length || 0)
  //                   }
  //                   onDeleteComments={indices => handleDeleteComments(`${firebaseGenePath}/name_comments`, indices)}
  //                   onResolveComment={index => handleResolveComment(`${firebaseGenePath}/name_comments/${index}`)}
  //                   onUnresolveComment={index => handleUnresolveComment(`${firebaseGenePath}/name_comments/${index}`)}
  //                 />
  //                 <div>
  //                   <span>
  //                     {geneEntity?.entrezGeneId && (
  //                       <span className="ml-2">
  //                         <span className="font-weight-bold text-nowrap">Entrez Gene:</span>
  //                         <span className="ml-1">
  //                           <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
  //                         </span>
  //                       </span>
  //                     )}
  //                     {geneEntity?.hgncId && (
  //                       <span className="ml-2">
  //                         <span className="font-weight-bold">HGNC:</span>
  //                         <span className="ml-1">
  //                           <HgncLink id={geneEntity.hgncId} />
  //                         </span>
  //                       </span>
  //                     )}
  //                     {geneEntity?.synonyms && geneEntity.synonyms.length > 0 && (
  //                       <span className="ml-2">
  //                         <span className="font-weight-bold">Gene aliases:</span>
  //                         <span className="ml-1">
  //                           <WithSeparator separator={', '}>
  //                             {geneEntity.synonyms.map(synonym => (
  //                               <span className={'text-nowrap'} key={synonym.name}>
  //                                 {synonym.name}
  //                               </span>
  //                             ))}
  //                           </WithSeparator>
  //                         </span>
  //                       </span>
  //                     )}
  //                     <span className="ml-2">
  //                       <span className="font-weight-bold mr-2">External Links:</span>
  //                       <WithSeparator separator={InlineDivider}>
  //                         <a href={`https://cbioportal.mskcc.org/ln?q=${props.data.name}`} target="_blank" rel="noopener noreferrer">
  //                           {CBIOPORTAL} <ExternalLinkIcon />
  //                         </a>
  //                         <a
  //                           href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${props.data.name}`}
  //                           target="_blank"
  //                           rel="noopener noreferrer"
  //                         >
  //                           {COSMIC} <ExternalLinkIcon />
  //                         </a>
  //                       </WithSeparator>
  //                     </span>
  //                   </span>
  //                 </div>
  //               </>
  //             )}
  //           </div>
  //           {getReviewButtons()}
  //         </Col>
  //       </Row>
  //       {isReviewing ? (
  //         <ReviewPage
  //           hugoSymbol={hugoSymbol}
  //           firebasePath={firebaseGenePath}
  //           reviewFinished={isReviewFinished}
  //           handleReviewFinished={handleReviewFinished}
  //           drugList={props.drugList}
  //         />
  //       ) : (
  //         <>
  //           <Row className={`${getSectionClassName()} justify-content-between`}>
  //             <Col>
  //               <RealtimeCheckedInputGroup
  //                 groupHeader={
  //                   <>
  //                     <span className="mr-2">Gene Type</span>
  //                     {<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Type'} />}
  //                   </>
  //                 }
  //                 options={[GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE].map(label => {
  //                   return {
  //                     label,
  //                     fieldKey: GENE_TYPE_KEY[label],
  //                   };
  //                 })}
  //               />
  //               <RealtimeTextAreaInput
  //                 fieldKey="summary"
  //                 label="Somatic Gene Summary "
  //                 labelIcon={
  //                   <>
  //                     <GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Summary'} />
  //                     <div className="mr-3" />
  //                     <CommentIcon
  //                       id={props.data.summary_uuid}
  //                       comments={props.data.summary_comments || []}
  //                       onCreateComment={content =>
  //                         handleCreateComment(`${firebaseGenePath}/summary_comments`, content, props.data.summary_comments?.length || 0)
  //                       }
  //                       onDeleteComments={indices => handleDeleteComments(`${firebaseGenePath}/summary_comments`, indices)}
  //                       onResolveComment={index => handleResolveComment(`${firebaseGenePath}/summary_comments/${index}`)}
  //                       onUnresolveComment={index => handleUnresolveComment(`${firebaseGenePath}/summary_comments/${index}`)}
  //                     />
  //                   </>
  //                 }
  //               />
  //               <RealtimeTextAreaInput
  //                 fieldKey="germline_summary"
  //                 label="Germline Gene Summary"
  //                 labelIcon={
  //                   <>
  //                     <GeneHistoryTooltip historyData={parsedHistoryList} location={'Germline Gene Summary'} />
  //                     <div className="mr-3" />
  //                     <CommentIcon
  //                       id={props.data.germline_summary_uuid}
  //                       comments={props.data.germline_summary_comments || []}
  //                       onCreateComment={content =>
  //                         handleCreateComment(
  //                           `${firebaseGenePath}/germline_summary_comments`,
  //                           content,
  //                           props.data.germline_summary_comments?.length || 0
  //                         )
  //                       }
  //                       onDeleteComments={indices => handleDeleteComments(`${firebaseGenePath}/germline_summary_comments`, indices)}
  //                       onResolveComment={index => handleResolveComment(`${firebaseGenePath}/germline_summary_comments/${index}`)}
  //                       onUnresolveComment={index => handleUnresolveComment(`${firebaseGenePath}/germline_summary_comments/${index}`)}
  //                     />
  //                   </>
  //                 }
  //               />
  //             </Col>
  //           </Row>
  //           <Row>
  //             <Col md={6}>
  //               <RealtimeCheckedInputGroup
  //                 groupHeader="Penetrance"
  //                 isRadio
  //                 options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER, RADIO_OPTION_NONE].map(label => {
  //                   return {
  //                     label,
  //                     fieldKey: 'penetrance',
  //                   };
  //                 })}
  //               />
  //             </Col>
  //           </Row>
  //           <Row className={'mb-5'}>
  //             <Col>
  //               <RealtimeTextAreaInput
  //                 fieldKey="background"
  //                 inputClass={styles.textarea}
  //                 label="Background"
  //                 name="geneBackground"
  //                 labelIcon={
  //                   <>
  //                     <GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Background'} />
  //                     <div className="mr-3" />
  //                     <CommentIcon
  //                       id={props.data.background_uuid}
  //                       comments={props.data.background_comments || []}
  //                       onCreateComment={content =>
  //                         handleCreateComment(
  //                           `${firebaseGenePath}/background_comments`,
  //                           content,
  //                           props.data.background_comments?.length || 0
  //                         )
  //                       }
  //                       onDeleteComments={indices => handleDeleteComments(`${firebaseGenePath}/background_comments`, indices)}
  //                       onResolveComment={index => handleResolveComment(`${firebaseGenePath}/background_comments/${index}`)}
  //                       onUnresolveComment={index => handleUnresolveComment(`${firebaseGenePath}/background_comments/${index}`)}
  //                     />
  //                   </>
  //                 }
  //               />
  //               <div className="mb-2">
  //                 <AutoParseRefField summary={props.data.background} />
  //               </div>
  //             </Col>
  //           </Row>
  //           {props.data.mutations ? (
  //             <div className={'mb-5'}>
  //               {openMutationCollapsible ? (
  //                 <Row className="mb-4">
  //                   <Col>
  //                     <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
  //                       <span className={styles.link} onClick={() => setOpenMutationCollapsible(null)}>
  //                         Mutations
  //                       </span>
  //                       <span className="px-2" style={{ color: '#6c757d' }}>
  //                         /
  //                       </span>
  //                       <span>{openMutationCollapsible.name}</span>
  //                     </div>
  //                   </Col>
  //                 </Row>
  //               ) : (
  //                 <Row>
  //                   <Col>
  //                     <div className={'d-flex justify-content-between align-items-center mb-2'}>
  //                       <div className="mb-2 d-flex align-items-center">
  //                         <h5 className="mb-0 mr-2">Mutations:</h5>{' '}
  //                         <AddMutationButton
  //                           showAddMutationModal={showAddMutationModal}
  //                           onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
  //                         />
  //                         {mutationsAreFiltered && (
  //                           <span>{`Showing ${mutations.length} of ${props.data.mutations.length} matching the search`}</span>
  //                         )}
  //                       </div>
  //                       <div style={{ display: 'flex', alignItems: 'center' }}>
  //                         <FaFilter
  //                           color={mutationsAreFiltered ? 'gold' : null}
  //                           style={{ cursor: 'pointer' }}
  //                           onClick={handleToggleFilterModal}
  //                           className="mr-2"
  //                           id="filter"
  //                         />
  //                         <Input
  //                           placeholder={'Search Mutation'}
  //                           value={mutationFilter}
  //                           onChange={event => setMutationFilter(event.target.value)}
  //                         />
  //                       </div>
  //                     </div>
  //                   </Col>
  //                 </Row>
  //               )}
  //               {getMutationCollapsibles()}
  //             </div>
  //           ) : (
  //             <AddMutationButton
  //               showAddMutationModal={showAddMutationModal}
  //               onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
  //               showFullTitle
  //               showIcon={false}
  //             />
  //           )}
  //           <VusTable hugoSymbol={hugoSymbol} mutationList={props.data.mutations} />
  //           <Modal isOpen={showFilterModal} toggle={handleToggleFilterModal}>
  //             <ModalHeader>
  //               <Container>
  //                 <Row>
  //                   <Col>Filters</Col>
  //                 </Row>
  //               </Container>
  //             </ModalHeader>
  //             <ModalBody>
  //               <Container>
  //                 <h6 className="mb-2">Oncogenicity</h6>
  //                 <Row>
  //                   {tempOncogenicityFilter.map((filter, index) => {
  //                     const isDisabled = !enabledCheckboxes.includes(filter.label);
  //                     return (
  //                       <Col className="col-6" key={filter.label}>
  //                         <InputGroup>
  //                           <Input
  //                             id={`oncogenicity-filter-${filter.label}`}
  //                             onChange={() => handleFilterCheckboxChange(index, setTempOncogenicityFilter)}
  //                             checked={filter.selected}
  //                             disabled={isDisabled}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
  //                             type="checkbox"
  //                           />
  //                           <Label
  //                             for={`oncogenicity-filter-${filter.label}`}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
  //                           >
  //                             {filter.label}
  //                           </Label>
  //                         </InputGroup>
  //                       </Col>
  //                     );
  //                   })}
  //                 </Row>
  //                 <h6 className="mb-2 mt-2">Mutation effect</h6>
  //                 <Row>
  //                   {tempMutationEffectFilter.map((filter, index) => {
  //                     const isDisabled = !enabledCheckboxes.includes(filter.label);

  //                     return (
  //                       <Col className="col-6" key={filter.label}>
  //                         <InputGroup>
  //                           <Input
  //                             id={`mutation-effect-filter-${filter.label}`}
  //                             onChange={() => handleFilterCheckboxChange(index, setTempMutationEffectFilter)}
  //                             checked={filter.selected}
  //                             disabled={isDisabled}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
  //                             type="checkbox"
  //                           />
  //                           <Label
  //                             for={`mutation-effect-filter-${filter.label}`}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
  //                           >
  //                             {filter.label}
  //                           </Label>
  //                         </InputGroup>
  //                       </Col>
  //                     );
  //                   })}
  //                 </Row>
  //                 <h6 className="mb-2 mt-2">Therapeutic levels</h6>
  //                 <Row className="align-items-start justify-content-start">
  //                   {tempTxLevelFilter.map((filter, index) => {
  //                     const isDisabled = !enabledCheckboxes.includes(filter.label);

  //                     return (
  //                       <Col style={{ flexGrow: 0 }} key={filter.label}>
  //                         <InputGroup>
  //                           <Input
  //                             id={`tx-level-filter-${filter.label}`}
  //                             onChange={() => handleFilterCheckboxChange(index, setTempTxLevelFilter)}
  //                             checked={filter.selected}
  //                             disabled={isDisabled}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
  //                             type="checkbox"
  //                           />
  //                           <Label
  //                             for={`tx-level-filter-${filter.label}`}
  //                             style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
  //                           >
  //                             {filter.label}
  //                           </Label>
  //                         </InputGroup>
  //                       </Col>
  //                     );
  //                   })}
  //                 </Row>
  //                 <Row className="justify-content-end">
  //                   {showFilterModalCancelButton && (
  //                     <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
  //                       <Button
  //                         outline
  //                         color="danger"
  //                         onClick={() => {
  //                           setTempOncogenicityFilter(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
  //                           setTempMutationEffectFilter(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
  //                           setTempTxLevelFilter(initFilterCheckboxState(TX_LEVEL_OPTIONS));
  //                         }}
  //                       >
  //                         Reset
  //                       </Button>
  //                     </Col>
  //                   )}
  //                   <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
  //                     <Button
  //                       color="primary"
  //                       onClick={() => {
  //                         setOncogenicityFilter(tempOncogenicityFilter);
  //                         setMutationEffectFilter(tempMutationEffectFilter);
  //                         setTxLevelFilter(tempTxLevelFilter);
  //                         setShowFilterModal(false);
  //                       }}
  //                     >
  //                       Confirm
  //                     </Button>
  //                   </Col>
  //                   <Col className="px-0" style={{ flexGrow: 0 }}>
  //                     <Button
  //                       color="secondary"
  //                       onClick={() => {
  //                         setTempOncogenicityFilter(oncogenicityFilter);
  //                         setTempMutationEffectFilter(mutationEffectFilter);
  //                         setTempTxLevelFilter(txLevelFilter);
  //                         setShowFilterModal(false);
  //                       }}
  //                     >
  //                       Cancel
  //                     </Button>
  //                   </Col>
  //                 </Row>
  //               </Container>
  //             </ModalBody>
  //           </Modal>
  //         </>
  //       )}
  //     </div>
  //     <RelevantCancerTypesModal
  //       onConfirm={async (newRelevantCancerTypes, noneDeleted) => {
  //         try {
  //           if (noneDeleted) {
  //             await props.setUntemplated(props.relevantCancerTypesModalStore.pathToRelevantCancerTypes, []);
  //           } else {
  //             await props.setUntemplated(props.relevantCancerTypesModalStore.pathToRelevantCancerTypes, newRelevantCancerTypes);
  //           }
  //           props.relevantCancerTypesModalStore.closeModal();
  //         } catch (error) {
  //           notifyError(error);
  //         }
  //       }}
  //       onCancel={() => props.relevantCancerTypesModalStore.closeModal()}
  //     />
  //     {showAddMutationModal ? (
  //       <AddMutationModal
  //         mutationList={props.data?.mutations}
  //         vusList={props.vusData}
  //         hugoSymbol={hugoSymbol}
  //         onConfirm={async alterations => {
  //           if (alterations.length > 0) {
  //             const newMutation = new Mutation(alterations.map(alteration => alteration.name).join(', '));
  //             newMutation.alterations = alterations;

  //             try {
  //               await props.updateMutations(`${firebaseGenePath}/mutations`, [newMutation]);
  //             } catch (error) {
  //               notifyError(error);
  //             }
  //           }
  //           setShowAddMutationModal(show => !show);
  //         }}
  //         onCancel={() => {
  //           setShowAddMutationModal(show => !show);
  //         }}
  //       />
  //     ) : undefined}
  //     <OncoKBSidebar>
  //       <Tabs
  //         tabs={[
  //           {
  //             title: 'Tools',
  //             content: <CurationToolsTab />,
  //           },
  //           {
  //             title: 'History',
  //             content: <CurationHistoryTab historyData={props.historyData} />,
  //           },
  //         ]}
  //       />
  //     </OncoKBSidebar>
  //   </>
  // ) : (
  //   <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
  // );
};

const mapStoreToProps = ({
  geneStore,
  firebaseGeneStore,
  firebaseVusStore,
  firebaseMetaStore,
  firebaseHistoryStore,
  drugStore,
  authStore,
  firebaseStore,
  relevantCancerTypesModalStore,
}: IRootStore) => ({
  searchGeneEntities: geneStore.searchEntities,
  geneEntities: geneStore.entities,
  loadingGenes: geneStore.loading,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  updateMutations: firebaseGeneStore.pushToArrayFront,
  setUntemplated: firebaseGeneStore.createUntemplated,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
  deleteSection: firebaseGeneStore.deleteSection,
  mutationSummaryStats: firebaseGeneStore.mutationLevelMutationSummaryStats,
  addMetaListener: firebaseMetaStore.addListener,
  addMetaCollaboratorsListener: firebaseMetaStore.addMetaCollaboratorsListener,
  addMetaListListener: firebaseMetaStore.addMetaListListener,
  metaData: firebaseMetaStore.data,
  metaListData: firebaseMetaStore.metaList,
  getDrugs: drugStore.getEntities,
  drugList: drugStore.entities,
  metaCollaboratorsData: firebaseMetaStore.metaCollaborators,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  updateMeta: firebaseMetaStore.update,
  historyData: firebaseHistoryStore.data,
  addHistoryListener: firebaseHistoryStore.addListener,
  handleFirebaseUpdateUntemplated: firebaseGeneStore.updateUntemplated,
  handleFirebaseDeleteFromArray: firebaseGeneStore.deleteFromArray,
  account: authStore.account,
  firebaseInitSuccess: firebaseStore.firebaseInitSuccess,
  fullName: authStore.fullName,
  relevantCancerTypesModalStore,
  addVusListener: firebaseVusStore.addListener,
  vusData: firebaseVusStore.data,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
