import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Button, Col, Container, Input, InputGroup, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import { IRootStore } from 'app/stores';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import {
  CANCER_TYPE_THERAPY_INDENTIFIER,
  CBIOPORTAL,
  CHECKBOX_LABEL_LEFT_MARGIN,
  COSMIC,
  GERMLINE_INHERITANCE_MECHANISM,
  GET_ALL_DRUGS_PAGE_SIZE,
  PAGE_ROUTE,
  PATHOGENICITY,
  PENETRANCE,
} from 'app/config/constants/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getCancerTypeName, getSectionClassName } from 'app/shared/util/utils';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import { getFirebasePath, getMutationName, getTxName } from 'app/shared/util/firebase/firebase-utils';
import styles from './styles.module.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { CancerType, DX_LEVELS, HistoryRecord, Mutation, PX_LEVELS, TX_LEVELS, Treatment } from 'app/shared/model/firebase/firebase.model';
import RealtimeDropdownInput from 'app/shared/firebase/input/RealtimeDropdownInput';
import { GENE_TYPE, GENE_TYPE_KEY, MUTATION_EFFECT_OPTIONS, ONCOGENICITY_OPTIONS, TX_LEVEL_OPTIONS } from 'app/config/constants/firebase';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import VusTable from '../../shared/table/VusTable';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import Tabs from 'app/components/tabs/tabs';
import CurationHistoryTab from 'app/components/tabs/CurationHistoryTab';
import { FaFilter } from 'react-icons/fa';
import _ from 'lodash';
import MutationCollapsible from './collapsible/MutationCollapsible';
import { IDrug } from 'app/shared/model/drug.model';
import ModifyTherapyModal from 'app/shared/modal/ModifyTherapyModal';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export type ParsedHistoryRecord = { record: HistoryRecord; timestamp: string; admin: string };

export type FirebaseMutation = Mutation & {
  firebaseIndex: number;
};

const CurationPage = (props: ICurationPageProps) => {
  const history = useHistory();
  const hugoSymbol = props.match.params.hugoSymbol;
  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const firebaseHistoryPath = getFirebasePath('HISTORY', hugoSymbol);
  const [mutationFilter, setMutationFilter] = useState('');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mutations, setMutations] = useState<FirebaseMutation[]>([]);

  const [oncogenicityFilter, setOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
  const [tempOncogenicityFilter, setTempOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));

  const [mutationEffectFilter, setMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
  const [tempMutationEffectFilter, setTempMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));

  const [txLevelFilter, setTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));
  const [tempTxLevelFilter, setTempTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));

  const [enabledCheckboxes, setEnabledCheckboxes] = useState<string[]>([]);

  const [drugList, setDrugList] = useState<IDrug[]>([]);

  function initFilterCheckboxState(options: string[]) {
    return options.map(option => ({ label: option, selected: false, disabled: false }));
  }

  const mutationsAreFiltered = useMemo(() => {
    return (
      oncogenicityFilter.some(filter => filter.selected) ||
      mutationEffectFilter.some(filter => filter.selected) ||
      txLevelFilter.some(filter => filter.selected)
    );
  }, [oncogenicityFilter, mutationEffectFilter, txLevelFilter]);

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

  useEffect(() => {
    props.searchEntities({ query: hugoSymbol });
    const cleanupCallbacks = [];
    cleanupCallbacks.push(props.addListener(firebaseGenePath));
    cleanupCallbacks.push(props.addHistoryListener(firebaseHistoryPath));
    cleanupCallbacks.push(() => props.updateCollaborator(hugoSymbol, false));
    cleanupCallbacks.push(props.addMetaCollaboratorsListener());
    return () => {
      cleanupCallbacks.forEach(callback => callback && callback());
    };
  }, []);

  const geneEntity = useMemo(() => {
    return props.entities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.entities]);

  useEffect(() => {
    if (props.metaCollaboratorsData && props.data?.name) {
      props.updateCollaborator(hugoSymbol, true).catch(error => {
        notifyError(error);
        history.push(PAGE_ROUTE.CURATION);
      });
    }
  }, [props.metaCollaboratorsData, props.data]);

  useEffect(() => {
    filterMutations();
  }, [props.data, mutationFilter, oncogenicityFilter, mutationEffectFilter, txLevelFilter]);

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
    async function fetchAllDrugs() {
      const drugs = await props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
      setDrugList(drugs['data']);
    }

    fetchAllDrugs();
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
      props.data?.mutations?.reduce<FirebaseMutation[]>((filteredMutations, mutation, index) => {
        const matchesName = !mutationFilter || getMutationName(mutation).toLowerCase().includes(mutationFilter.toLowerCase());

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
          return [...filteredMutations, { ...mutation, firebaseIndex: index }];
        }
        return filteredMutations;
      }, []) || []
    );
  }

  return !!props.data && drugList.length > 0 && !!geneEntity ? (
    <>
      <div>
        <Row>
          <Col>
            <h2>Gene: {props.data.name}</h2>
          </Col>
        </Row>
        <Row className={`${getSectionClassName()} justify-content-between`}>
          <Col>
            <div className={'d-flex mb-2'}>
              <div>
                <span className="font-weight-bold">Entrez Gene:</span>
                <span className="ml-1">
                  <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
                </span>
              </div>
              <div className="ml-2">
                <span className="font-weight-bold">Gene aliases:</span>
                <span className="ml-1">
                  <PubmedGeneArticlesLink hugoSymbols={geneEntity.synonyms?.map(synonym => synonym.name)} />
                </span>
              </div>
            </div>
            <RealtimeTextAreaInput
              fieldKey="summary"
              label="Summary"
              labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Summary'} />}
            />
            <RealtimeCheckedInputGroup
              groupHeader={
                <>
                  <span className="mr-2">Gene Type</span>
                  {<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Type'} />}
                </>
              }
              options={[GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE].map(label => {
                return {
                  label,
                  fieldKey: GENE_TYPE_KEY[label],
                };
              })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <RealtimeCheckedInputGroup
              groupHeader="Penetrance"
              isRadio
              options={[PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER].map(label => {
                return {
                  label,
                  fieldKey: 'penetrance',
                };
              })}
            />
          </Col>
        </Row>
        <Row className={'mb-5'}>
          <Col>
            <RealtimeTextAreaInput
              fieldKey="background"
              inputClass={styles.textarea}
              label="Background"
              name="geneBackground"
              labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Background'} />}
            />
            <div className="mb-2">
              <AutoParseRefField summary={props.data.background} />
            </div>
            <div>
              <span className="font-weight-bold mr-2">External Links:</span>
              <WithSeparator separator={InlineDivider}>
                <a href={`https://cbioportal.mskcc.org/ln?q=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                  {CBIOPORTAL} <ExternalLinkIcon />
                </a>
                <a href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${props.data.name}`} target="_blank" rel="noopener noreferrer">
                  {COSMIC} <ExternalLinkIcon />
                </a>
              </WithSeparator>
            </div>
          </Col>
        </Row>
        {props.data.mutations && (
          <div className={'mb-5'}>
            <Row>
              <Col>
                <div className={'d-flex justify-content-between align-items-center mb-2'}>
                  <div className="mb-2 d-flex align-items-center">
                    <h5 className="mb-0 mr-2">Mutations:</h5>{' '}
                    {mutationsAreFiltered && (
                      <span>{`Showing ${mutations.length} of ${props.data.mutations.length} matching the search`}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaFilter
                      color={mutationsAreFiltered ? 'gold' : null}
                      style={{ cursor: 'pointer' }}
                      onClick={handleToggleFilterModal}
                      className="mr-2"
                      id="filter"
                    />
                    <Input
                      placeholder={'Search Mutation'}
                      value={mutationFilter}
                      onChange={event => setMutationFilter(event.target.value)}
                    />
                  </div>
                </div>
              </Col>
            </Row>
            {mutations.map(mutation => (
              <Row key={mutation.firebaseIndex} className={'mb-2'}>
                <Col>
                  <MutationCollapsible
                    mutation={mutation}
                    firebaseIndex={mutation.firebaseIndex}
                    parsedHistoryList={parsedHistoryList}
                    drugList={drugList}
                  />
                </Col>
              </Row>
            ))}
          </div>
        )}
        <VusTable hugoSymbol={hugoSymbol} />
        <Modal isOpen={showFilterModal} toggle={handleToggleFilterModal}>
          <ModalHeader>
            <Container>
              <Row>
                <Col>Filters</Col>
              </Row>
            </Container>
          </ModalHeader>
          <ModalBody>
            <Container>
              <h6 className="mb-2">Oncogenicity</h6>
              <Row>
                {tempOncogenicityFilter.map((filter, index) => {
                  const isDisabled = !enabledCheckboxes.includes(filter.label);
                  return (
                    <Col className="col-6" key={filter.label}>
                      <InputGroup>
                        <Input
                          id={`oncogenicity-filter-${filter.label}`}
                          onChange={() => handleFilterCheckboxChange(index, setTempOncogenicityFilter)}
                          checked={filter.selected}
                          disabled={isDisabled}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                          type="checkbox"
                        />
                        <Label
                          for={`oncogenicity-filter-${filter.label}`}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                        >
                          {filter.label}
                        </Label>
                      </InputGroup>
                    </Col>
                  );
                })}
              </Row>
              <h6 className="mb-2 mt-2">Mutation effect</h6>
              <Row>
                {tempMutationEffectFilter.map((filter, index) => {
                  const isDisabled = !enabledCheckboxes.includes(filter.label);

                  return (
                    <Col className="col-6" key={filter.label}>
                      <InputGroup>
                        <Input
                          id={`mutation-effect-filter-${filter.label}`}
                          onChange={() => handleFilterCheckboxChange(index, setTempMutationEffectFilter)}
                          checked={filter.selected}
                          disabled={isDisabled}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                          type="checkbox"
                        />
                        <Label
                          for={`mutation-effect-filter-${filter.label}`}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                        >
                          {filter.label}
                        </Label>
                      </InputGroup>
                    </Col>
                  );
                })}
              </Row>
              <h6 className="mb-2 mt-2">Therapeutic levels</h6>
              <Row className="align-items-start justify-content-start">
                {tempTxLevelFilter.map((filter, index) => {
                  const isDisabled = !enabledCheckboxes.includes(filter.label);

                  return (
                    <Col style={{ flexGrow: 0 }} key={filter.label}>
                      <InputGroup>
                        <Input
                          id={`tx-level-filter-${filter.label}`}
                          onChange={() => handleFilterCheckboxChange(index, setTempTxLevelFilter)}
                          checked={filter.selected}
                          disabled={isDisabled}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                          type="checkbox"
                        />
                        <Label
                          for={`tx-level-filter-${filter.label}`}
                          style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                        >
                          {filter.label}
                        </Label>
                      </InputGroup>
                    </Col>
                  );
                })}
              </Row>
              <Row className="justify-content-end">
                {showFilterModalCancelButton && (
                  <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
                    <Button
                      outline
                      color="danger"
                      onClick={() => {
                        setTempOncogenicityFilter(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
                        setTempMutationEffectFilter(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
                        setTempTxLevelFilter(initFilterCheckboxState(TX_LEVEL_OPTIONS));
                      }}
                    >
                      Reset
                    </Button>
                  </Col>
                )}
                <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
                  <Button
                    color="primary"
                    onClick={() => {
                      setOncogenicityFilter(tempOncogenicityFilter);
                      setMutationEffectFilter(tempMutationEffectFilter);
                      setTxLevelFilter(tempTxLevelFilter);
                      setShowFilterModal(false);
                    }}
                  >
                    Confirm
                  </Button>
                </Col>
                <Col className="px-0" style={{ flexGrow: 0 }}>
                  <Button
                    color="secondary"
                    onClick={() => {
                      setTempOncogenicityFilter(oncogenicityFilter);
                      setTempMutationEffectFilter(mutationEffectFilter);
                      setTempTxLevelFilter(txLevelFilter);
                      setShowFilterModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Container>
          </ModalBody>
        </Modal>
      </div>
      <ModifyTherapyModal
        onConfirm={() => {}}
        treatment={
          new Treatment(
            '5fce3074-e420-4c36-9603-2423daf20118, 5fce3074-e420-4c36-9603-2423daf20118 + 3bbe37b1-edc8-4c54-93f8-5360d9a83d69, d7b1d12a-e942-4801-bb64-916c9bdfaaf3, d7b1d12a-e942-4801-bb64-916c9bdfaaf3 + 3bbe37b1-edc8-4c54-93f8-5360d9a83d69'
          )
        }
      />
      <OncoKBSidebar>
        <Tabs
          tabs={[
            {
              title: 'History',
              content: <CurationHistoryTab historyData={props.historyData} />,
            },
          ]}
        />
      </OncoKBSidebar>
    </>
  ) : (
    <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
  );
};

const mapStoreToProps = ({ geneStore, firebaseGeneStore, firebaseMetaStore, firebaseHistoryStore, drugStore, authStore }: IRootStore) => ({
  searchEntities: geneStore.searchEntities,
  entities: geneStore.entities,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
  deleteSection: firebaseGeneStore.deleteSection,
  mutationSummaryStats: firebaseGeneStore.mutationLevelMutationSummaryStats,
  addMetaCollaboratorsListener: firebaseMetaStore.addMetaCollaboratorsListener,
  metaData: firebaseMetaStore.data,
  getDrugs: drugStore.getEntities,
  metaCollaboratorsData: firebaseMetaStore.metaCollaborators,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  historyData: firebaseHistoryStore.data,
  addHistoryListener: firebaseHistoryStore.addListener,
  account: authStore.account,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
