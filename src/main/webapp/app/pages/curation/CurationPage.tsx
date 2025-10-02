import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { getFirebaseGenePath, getFirebaseHistoryPath, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { Col, Row } from 'reactstrap';
import { GENE_TYPE, INHERITANCE_MECHANISM_OPTIONS, READABLE_FIELD, PENETRANCE_OPTIONS, GENE_TYPE_KEY } from 'app/config/constants/firebase';
import { GET_ALL_DRUGS_PAGE_SIZE, PAGE_ROUTE, RADIO_OPTION_NONE } from 'app/config/constants/constants';
import CommentIcon from 'app/shared/icons/CommentIcon';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import MutationsSection from './mutation/MutationsSection';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import CurationHistoryTab from 'app/components/tabs/CurationHistoryTab';
import CurationToolsTab from 'app/components/tabs/CurationToolsTab';
import Tabs from 'app/components/tabs/tabs';
import { LabelsRefMap, RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import GeneHeader from './header/GeneHeader';
import VusTable from 'app/shared/table/VusTable';
import * as styles from './styles.module.scss';
import CurationReferencesTab from 'app/components/tabs/CurationReferencesTab';
import GenomicIndicatorsTable from 'app/shared/table/GenomicIndicatorsTable';
import GeneRealtimeComponentHeader from './header/GeneRealtimeComponentHeader';
import RelevantCancerTypesModal from 'app/shared/modal/RelevantCancerTypesModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { parseHistory } from 'app/shared/util/firebase/firebase-history-utils';
import { useMatchGeneEntity } from 'app/hooks/useMatchGeneEntity';
import { Unsubscribe, get, ref, onValue } from 'firebase/database';
import { getLocationIdentifier, getTooltipHistoryList } from 'app/components/geneHistoryTooltip/gene-history-tooltip-utils';
import GeneticTypeTabs, { GENETIC_TYPE } from './geneticTypeTabs/GeneticTypeTabs';
import GeneticTypeTabHeader from './header/GeneticTypeTabHeader';
import ReadOnlyBanner from './header/ReadOnlyBanner';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export const CurationPage = (props: ICurationPageProps) => {
  const history = useHistory();
  const isGermline = props.isGermline;
  const hugoSymbolParam = decodeURIComponent(props.match.params.hugoSymbol ?? '');

  const [firebaseGeneExists, setFirebaseGeneExists] = useState(false);
  const mutationsSectionRef = useRef<HTMLDivElement>(null);

  const { geneEntity, hugoSymbol, geneIsFound } = useMatchGeneEntity(hugoSymbolParam, props.searchGeneEntities, props.geneEntities);

  const somaticFirebaseGenePath = getFirebaseGenePath(false, hugoSymbol);
  const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
  const firebaseHistoryPath = getFirebaseHistoryPath(isGermline, hugoSymbol);
  const mutationsPath = `${firebaseGenePath}/mutations`;
  const genomicIndicatorsPath = `${firebaseGenePath}/genomic_indicators`;
  const firebaseMetaGeneReviewPath = `${getFirebaseMetaGenePath(isGermline, hugoSymbol)}/review`;
  const firebaseMetaCurrentReviewerPath = `${firebaseMetaGeneReviewPath}/currentReviewer`;
  const firebaseMetaLastActiveReviewPath = `${firebaseMetaGeneReviewPath}/lastActiveReview`;

  useEffect(() => {
    async function checkIfGeneExists() {
      if (props.firebaseDb && hugoSymbol) {
        const snapshot = await get(ref(props.firebaseDb, firebaseGenePath));
        if (!snapshot.exists()) {
          try {
            await props.createGene(hugoSymbol, isGermline);
          } catch (error) {
            notifyError(error);
            if (isGermline) {
              history.push(PAGE_ROUTE.CURATION_GERMLINE);
            } else {
              history.push(PAGE_ROUTE.CURATION_SOMATIC);
            }
          }
        }
        setFirebaseGeneExists(true);
      }
    }

    checkIfGeneExists();
  }, [firebaseGenePath, setFirebaseGeneExists, props.firebaseDb, hugoSymbol, isGermline]);

  useEffect(() => {
    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
    return () => {
      props.setOpenMutationCollapsibleListKey(null);
    };
  }, []);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    if (geneEntity && props.firebaseInitSuccess) {
      const cleanupCallbacks: Unsubscribe[] = [];
      cleanupCallbacks.push(
        onValue(ref(props.firebaseDb, firebaseMetaCurrentReviewerPath), snapshot => {
          props.setReadOnly(!!snapshot.val());
        }),
      );
      cleanupCallbacks.push(props.addHistoryListener(firebaseHistoryPath));
      cleanupCallbacks.push(props.addMutationListListener(mutationsPath));
      return () => {
        cleanupCallbacks.forEach(callback => callback && callback());
      };
    }
  }, [geneEntity, props.firebaseInitSuccess, props.firebaseDb, firebaseGenePath, firebaseHistoryPath, firebaseMetaCurrentReviewerPath]);

  useEffect(() => {
    props.setIsMutationListRendered(false);
  }, [isGermline]);

  const tabHistoryList = useMemo(() => {
    if (!props.historyData) {
      return;
    }

    return parseHistory(props.historyData, props.drugList);
  }, [props.historyData]);

  const tooltipHistoryList = useMemo(() => {
    if (!tabHistoryList) {
      return;
    }

    return getTooltipHistoryList(tabHistoryList);
  }, [tabHistoryList]);

  useEffect(() => {
    async function checkLastActiveReview() {
      if (
        props.firebaseDb === undefined ||
        props.clearCurrentReviewer === undefined ||
        hugoSymbol === undefined ||
        isGermline === undefined
      ) {
        return;
      }

      const lastActiveReviewSnapshot = await get(ref(props.firebaseDb, firebaseMetaLastActiveReviewPath));
      const lastActiveReview: number | undefined = lastActiveReviewSnapshot.val();

      if (lastActiveReview !== undefined && Date.now() - lastActiveReview > 5 * 60 * 1000) {
        props.clearCurrentReviewer(hugoSymbol, isGermline);
      }
    }

    checkLastActiveReview();
    const interval = setInterval(
      () => {
        checkLastActiveReview();
      },
      5 * 60 * 1000,
    );

    return () => {
      clearInterval(interval);
    };
  }, [props.firebaseDb, firebaseMetaLastActiveReviewPath, hugoSymbol, isGermline, props.clearCurrentReviewer]);

  if (!geneIsFound) {
    return <div>the gene &quot;{hugoSymbolParam}&quot; was not found</div>;
  }

  function onGeneTypeClick(_: React.MouseEvent, label: string, labelsToRefs: LabelsRefMap) {
    Object.values(GENE_TYPE).forEach(type => {
      if (!labelsToRefs[type].current) return;
    });

    const isChecked = !labelsToRefs[label].current!.checked;
    if (!isChecked) {
      return;
    }

    const oncogeneRef = labelsToRefs[GENE_TYPE.ONCOGENE].current!;
    const tumorSuppressorRef = labelsToRefs[GENE_TYPE.TUMOR_SUPPRESSOR].current!;
    const neitherRef = labelsToRefs[GENE_TYPE.NEITHER].current!;
    const unknownRef = labelsToRefs[GENE_TYPE.INSUFFICIENT_EVIDENCE].current!;

    if (label === GENE_TYPE.TUMOR_SUPPRESSOR.toString() || label === GENE_TYPE.ONCOGENE.toString()) {
      unknownRef.checked && unknownRef.click();
      neitherRef.checked && neitherRef.click();
    } else if (label === GENE_TYPE.INSUFFICIENT_EVIDENCE.toString()) {
      tumorSuppressorRef.checked && tumorSuppressorRef.click();
      oncogeneRef.checked && oncogeneRef.click();
      neitherRef.checked && neitherRef.click();
    } else if (label === GENE_TYPE.NEITHER.toString()) {
      tumorSuppressorRef.checked && tumorSuppressorRef.click();
      oncogeneRef.checked && oncogeneRef.click();
      unknownRef.checked && unknownRef.click();
    }
  }

  const geneTypeOptions = isGermline
    ? [GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE]
    : [GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE, GENE_TYPE.NEITHER, GENE_TYPE.INSUFFICIENT_EVIDENCE];

  return props.firebaseInitSuccess &&
    !props.loadingGenes &&
    props.drugList.length > 0 &&
    !!geneEntity &&
    firebaseGeneExists &&
    hugoSymbol ? (
    <>
      <div style={{ visibility: props.isMutationListRendered ? 'visible' : 'hidden' }}>
        <GeneHeader firebaseGenePath={firebaseGenePath} geneEntity={geneEntity} isReviewing={false} />
        <GeneticTypeTabs geneEntity={geneEntity} geneticType={isGermline ? GENETIC_TYPE.GERMLINE : GENETIC_TYPE.SOMATIC} />
        <div className="d-flex justify-content-end mt-2 mb-2">
          <GeneticTypeTabHeader hugoSymbol={hugoSymbol} isReviewing={false} />
        </div>
        {props.readOnly && <ReadOnlyBanner hugoSymbol={hugoSymbol} />}
        <div className="mb-4">
          <Row className={'justify-content-between'}>
            <Col className="pb-2">
              <RealtimeCheckedInputGroup
                disabled={props.readOnly || isGermline}
                groupHeader={
                  <>
                    <span className="me-2">Gene Type</span>
                    {
                      <GeneHistoryTooltip
                        historyData={tooltipHistoryList}
                        location={READABLE_FIELD.GENE_TYPE}
                        locationIdentifier={getLocationIdentifier({ fields: [READABLE_FIELD.GENE_TYPE] })}
                      />
                    }
                  </>
                }
                options={geneTypeOptions.map(label => {
                  return {
                    label,
                    firebasePath: `${somaticFirebaseGenePath}/${GENE_TYPE_KEY[label]}`,
                  };
                })}
                onMouseDown={onGeneTypeClick}
                labelOnClick={onGeneTypeClick}
              />
              <RealtimeTextAreaInput
                disabled={props.readOnly}
                firebasePath={`${firebaseGenePath}/summary`}
                inputClass={styles.textarea}
                label="Gene Summary"
                name="geneSummary"
                labelIcon={
                  <GeneRealtimeComponentHeader
                    tooltip={
                      <GeneHistoryTooltip
                        historyData={tooltipHistoryList}
                        location={READABLE_FIELD.SUMMARY}
                        locationIdentifier={getLocationIdentifier({ fields: [READABLE_FIELD.SUMMARY] })}
                      />
                    }
                    commentIcon={<CommentIcon id={`${hugoSymbol}_gene_summary`} path={`${firebaseGenePath}/summary_comments`} />}
                  />
                }
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <RealtimeTextAreaInput
                disabled={props.readOnly || isGermline}
                firebasePath={`${somaticFirebaseGenePath}/background`}
                inputClass={styles.textarea}
                label="Background"
                name="geneBackground"
                parseRefs
                labelIcon={
                  <GeneRealtimeComponentHeader
                    tooltip={
                      <GeneHistoryTooltip
                        historyData={tooltipHistoryList}
                        location={READABLE_FIELD.BACKGROUND}
                        locationIdentifier={getLocationIdentifier({ fields: [READABLE_FIELD.BACKGROUND] })}
                      />
                    }
                    commentIcon={
                      <CommentIcon id={`${hugoSymbol}_gene_background`} path={`${somaticFirebaseGenePath}/background_comments`} />
                    }
                  />
                }
              />
            </Col>
          </Row>
          {isGermline && (
            <>
              <div className="mb-3">
                <RealtimeCheckedInputGroup
                  disabled={props.readOnly}
                  groupHeader={
                    <GeneRealtimeComponentHeader
                      title="Penetrance"
                      tooltip={
                        <GeneHistoryTooltip
                          historyData={tooltipHistoryList}
                          location={READABLE_FIELD.PENETRANCE}
                          locationIdentifier={getLocationIdentifier({ fields: [READABLE_FIELD.PENETRANCE] })}
                        />
                      }
                      commentIcon={<CommentIcon id={`${hugoSymbol}_penetrance`} path={`${firebaseGenePath}/penetrance_comments`} />}
                    />
                  }
                  isRadio
                  options={[...PENETRANCE_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${firebaseGenePath}/penetrance`,
                  }))}
                />
              </div>
              <div className="mb-3">
                <RealtimeCheckedInputGroup
                  disabled={props.readOnly}
                  groupHeader={
                    <GeneRealtimeComponentHeader
                      title="Mechanism of Inheritance"
                      tooltip={
                        <GeneHistoryTooltip
                          historyData={tooltipHistoryList}
                          location={READABLE_FIELD.INHERITANCE_MECHANISM}
                          locationIdentifier={getLocationIdentifier({ fields: [READABLE_FIELD.INHERITANCE_MECHANISM] })}
                        />
                      }
                      commentIcon={
                        <CommentIcon id={`${hugoSymbol}_inheritanceMechanism`} path={`${firebaseGenePath}/inheritanceMechanism_comments`} />
                      }
                    />
                  }
                  isRadio
                  options={[...INHERITANCE_MECHANISM_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${firebaseGenePath}/inheritanceMechanism`,
                  }))}
                />
              </div>
              <GenomicIndicatorsTable genomicIndicatorsPath={genomicIndicatorsPath} />
            </>
          )}
        </div>
        <div ref={mutationsSectionRef}>
          <MutationsSection
            mutationsPath={mutationsPath}
            metaGeneReviewPath={firebaseMetaGeneReviewPath}
            hugoSymbol={hugoSymbol ?? ''}
            isGermline={isGermline}
            parsedHistoryList={tooltipHistoryList ?? new Map()}
          />
        </div>
        <VusTable hugoSymbol={hugoSymbol} isGermline={isGermline} mutationsSectionRef={mutationsSectionRef} />
        <RelevantCancerTypesModal
          onConfirm={async (newExcludedRCTs, noneDeleted) => {
            try {
              const newRCTs = noneDeleted ? {} : newExcludedRCTs;
              await props.updateRelevantCancerTypes(
                props.relevantCancerTypesModalStore.pathToRelevantCancerTypes ?? '',
                noneDeleted ? {} : props.relevantCancerTypesModalStore.firebaseExcludedRCTs ?? {},
                newRCTs,
                props.relevantCancerTypesModalStore.excludedRCTsReview!,
                props.relevantCancerTypesModalStore.excludedRCTsUuid!,
                isGermline,
                props.relevantCancerTypesModalStore.firebaseExcludedRCTs === undefined,
              );
              props.relevantCancerTypesModalStore.closeModal();
            } catch (error) {
              notifyError(error);
            }
          }}
          onCancel={() => props.relevantCancerTypesModalStore.closeModal()}
        />
        <OncoKBSidebar>
          <Tabs
            className="pe-4 ps-2 mt-1"
            tabs={[
              {
                title: 'Tools',
                content: (
                  <CurationToolsTab
                    genePath={firebaseGenePath}
                    somaticGenePath={somaticFirebaseGenePath}
                    isGermline={isGermline}
                    hugoSymbol={hugoSymbol ?? ''}
                  />
                ),
              },
              {
                title: 'History',
                content: <CurationHistoryTab historyData={tabHistoryList} />,
              },
              {
                title: 'References',
                content: <CurationReferencesTab genePath={firebaseGenePath} />,
              },
            ]}
          />
        </OncoKBSidebar>
      </div>
      {!props.isMutationListRendered && <LoadingIndicator key={'curation-page-loading'} size={LoaderSize.LARGE} center isLoading />}
    </>
  ) : (
    <LoadingIndicator key={'curation-page-loading'} size={LoaderSize.LARGE} center isLoading />
  );
};

const mapStoreToProps = ({
  geneStore,
  firebaseAppStore,
  firebaseHistoryStore,
  firebaseMutationListStore,
  drugStore,
  relevantCancerTypesModalStore,
  authStore,
  firebaseGeneService,
  openMutationCollapsibleStore,
  layoutStore,
  routerStore,
  curationPageStore,
  firebaseMetaService,
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  firebaseInitSuccess: firebaseAppStore.firebaseInitSuccess,
  searchGeneEntities: geneStore.searchEntities,
  geneEntities: geneStore.entities,
  loadingGenes: geneStore.loading,
  historyData: firebaseHistoryStore.data,
  addHistoryListener: firebaseHistoryStore.addListener,
  addMutationListListener: firebaseMutationListStore.addListener,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
  loadingDrugs: drugStore.loading,
  relevantCancerTypesModalStore,
  fullName: authStore.fullName,
  updateRelevantCancerTypes: firebaseGeneService.updateRelevantCancerTypes,
  createGene: firebaseGeneService.createGene,
  setOpenMutationCollapsibleListKey: openMutationCollapsibleStore.setOpenMutationCollapsibleListKey,
  toggleOncoKBSidebar: layoutStore.toggleOncoKBSidebar,
  isGermline: routerStore.isGermline,
  readOnly: curationPageStore.readOnly,
  setReadOnly: curationPageStore.setReadOnly,
  isMutationListRendered: curationPageStore.isMutationListRendered,
  setIsMutationListRendered: curationPageStore.setIsMutationListRendered,
  clearCurrentReviewer: firebaseMetaService.clearCurrentReviewer,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
