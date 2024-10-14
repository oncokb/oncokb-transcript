import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { RouteComponentProps } from 'react-router-dom';
import { getFirebaseGenePath, getFirebaseHistoryPath, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { Col, Row } from 'reactstrap';
import { getSectionClassName } from 'app/shared/util/utils';
import { GENE_TYPE, GENE_TYPE_KEY, INHERITANCE_MECHANISM_OPTIONS, READABLE_FIELD, PENETRANCE_OPTIONS } from 'app/config/constants/firebase';
import { GERMLINE_PATH, GET_ALL_DRUGS_PAGE_SIZE, RADIO_OPTION_NONE } from 'app/config/constants/constants';
import CommentIcon from 'app/shared/icons/CommentIcon';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import MutationsSection from './mutation/MutationsSection';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import CurationHistoryTab from 'app/components/tabs/CurationHistoryTab';
import CurationToolsTab from 'app/components/tabs/CurationToolsTab';
import Tabs from 'app/components/tabs/tabs';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import GeneHeader from './header/GeneHeader';
import VusTable from 'app/shared/table/VusTable';
import * as styles from './styles.module.scss';
import CurationReferencesTab from 'app/components/tabs/CurationReferencesTab';
import GenomicIndicatorsTable from 'app/shared/table/GenomicIndicatorsTable';
import GeneRealtimeComponentHeader from './header/GeneRealtimeComponentHeader';
import RelevantCancerTypesModal from 'app/shared/modal/RelevantCancerTypesModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { FlattenedHistory, parseHistory } from 'app/shared/util/firebase/firebase-history-utils';
import { useMatchGeneEntity } from 'app/hooks/useMatchGeneEntity';
import { Unsubscribe } from 'firebase/database';
import { getLocationIdentifier, getTooltipHistoryList } from 'app/components/geneHistoryTooltip/gene-history-tooltip-utils';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export const CurationPage = (props: ICurationPageProps) => {
  const pathname = props.location.pathname;
  const isGermline = pathname.includes(GERMLINE_PATH);
  const hugoSymbolParam = props.match.params.hugoSymbol;

  const [mutationListRendered, setMutationListRendered] = useState(false);
  const mutationsSectionRef = useRef<HTMLDivElement>(null);

  const { geneEntity, hugoSymbol } = useMatchGeneEntity(hugoSymbolParam, props.searchGeneEntities, props.geneEntities);

  const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
  const firebaseHistoryPath = getFirebaseHistoryPath(isGermline, hugoSymbol);
  const mutationsPath = `${firebaseGenePath}/mutations`;
  const genomicIndicatorsPath = `${firebaseGenePath}/genomic_indicators`;
  const firebaseMetaGeneReviewPath = `${getFirebaseMetaGenePath(isGermline, hugoSymbol)}/review`;
  const firebaseMetaCurrentReviewerPath = `${firebaseMetaGeneReviewPath}/currentReviewer`;

  useEffect(() => {
    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
    return () => {
      props.setOpenMutationCollapsibleIndex(null);
    };
  }, []);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    if (geneEntity && props.firebaseInitSuccess) {
      const cleanupCallbacks: Unsubscribe[] = [];
      cleanupCallbacks.push(props.addHistoryListener(firebaseHistoryPath));
      cleanupCallbacks.push(props.addMutationListListener(mutationsPath));
      return () => {
        cleanupCallbacks.forEach(callback => callback && callback());
      };
    }
  }, [geneEntity, props.firebaseInitSuccess, props.firebaseDb, firebaseGenePath, firebaseHistoryPath, firebaseMetaCurrentReviewerPath]);

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

  return props.firebaseInitSuccess && !props.loadingGenes && props.drugList.length > 0 && !!geneEntity ? (
    <>
      <div style={{ visibility: mutationListRendered ? 'visible' : 'hidden' }}>
        <GeneHeader
          hugoSymbol={hugoSymbol}
          firebaseGenePath={firebaseGenePath}
          geneEntity={geneEntity}
          isGermline={isGermline}
          isReviewing={false}
        />
        <div className="mb-4">
          <Row className={`${getSectionClassName()} justify-content-between`}>
            <Col className="pb-2">
              <RealtimeCheckedInputGroup
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
                options={[GENE_TYPE.TUMOR_SUPPRESSOR, GENE_TYPE.ONCOGENE].map(label => {
                  return {
                    label,
                    firebasePath: `${firebaseGenePath}/${GENE_TYPE_KEY[label]}`,
                  };
                })}
              />
              <RealtimeTextAreaInput
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
                firebasePath={`${firebaseGenePath}/background`}
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
                    commentIcon={<CommentIcon id={`${hugoSymbol}_gene_background`} path={`${firebaseGenePath}/background_comments`} />}
                  />
                }
              />
            </Col>
          </Row>
          {isGermline && (
            <>
              <div className="mb-3">
                <RealtimeCheckedInputGroup
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
            onMutationListRender={() => setMutationListRendered(true)}
          />
        </div>
        <VusTable hugoSymbol={hugoSymbol} isGermline={isGermline} mutationsSectionRef={mutationsSectionRef} />
        <RelevantCancerTypesModal
          onConfirm={async (newExcludedRCTs, noneDeleted) => {
            try {
              const newRCTs = noneDeleted ? [] : newExcludedRCTs;
              await props.updateRelevantCancerTypes(
                props.relevantCancerTypesModalStore.pathToRelevantCancerTypes ?? '',
                noneDeleted ? [] : props.relevantCancerTypesModalStore.firebaseExcludedRCTs ?? [],
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
                content: <CurationToolsTab genePath={firebaseGenePath} isGermline={isGermline} hugoSymbol={hugoSymbol ?? ''} />,
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
      {!mutationListRendered && <LoadingIndicator key={'curation-page-loading'} size={LoaderSize.LARGE} center isLoading />}
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
  relevantCancerTypesModalStore,
  fullName: authStore.fullName,
  updateRelevantCancerTypes: firebaseGeneService.updateRelevantCancerTypes,
  setOpenMutationCollapsibleIndex: openMutationCollapsibleStore.setOpenMutationCollapsibleIndex,
  toggleOncoKBSidebar: layoutStore.toggleOncoKBSidebar,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
