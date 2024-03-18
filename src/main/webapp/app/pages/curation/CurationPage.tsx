import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { RouteComponentProps } from 'react-router-dom';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import { Col, Row } from 'reactstrap';
import { getSectionClassName } from 'app/shared/util/utils';
import { GENE_TYPE, GENE_TYPE_KEY } from 'app/config/constants/firebase';
import { GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import { IGene } from 'app/shared/model/gene.model';
import { onValue, ref } from 'firebase/database';
import CommentIcon from 'app/shared/icons/CommentIcon';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import RelevantCancerTypesModal from 'app/shared/modal/RelevantCancerTypesModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import MutationsSection from './mutation/MutationsSection';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import CurationHistoryTab from 'app/components/tabs/CurationHistoryTab';
import CurationToolsTab from 'app/components/tabs/CurationToolsTab';
import Tabs from 'app/components/tabs/tabs';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import GeneHeader from './gene/GeneHeader';
import ReviewPage from './review/ReviewPage';
import VusTable from 'app/shared/table/VusTable';
import styles from './styles.module.scss';
import CurationReferencesTab from 'app/components/tabs/CurationReferencesTab';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export type ParsedHistoryRecord = { record: HistoryRecord; timestamp: number; admin: string };

export const CurationPage = (props: ICurationPageProps) => {
  const hugoSymbol = props.match.params.hugoSymbol.toUpperCase();

  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const firebaseHistoryPath = getFirebasePath('HISTORY', hugoSymbol);
  const firebaseMetaCurrentReviewerPath = `${getFirebasePath('META_GENE', hugoSymbol)}/review/currentReviewer`;

  const [geneName, setGeneName] = useState(undefined);

  const [isReviewing, setIsReviewing] = useState(false);
  const [isReviewFinished, setIsReviewFinished] = useState(false);

  useEffect(() => {
    if (props.firebaseInitSuccess) {
      props.searchGeneEntities({ query: hugoSymbol, exact: true });
      const cleanupCallbacks = [];
      props.addHistoryListener(firebaseHistoryPath);
      onValue(
        ref(props.firebaseDb, `${firebaseGenePath}/name`),
        snapshot => {
          setGeneName(snapshot.val());
        },
        { onlyOnce: true }
      );
      cleanupCallbacks.push(
        onValue(ref(props.firebaseDb, firebaseMetaCurrentReviewerPath), snapshot => {
          const currentReviewer = snapshot.val();
          setIsReviewing(currentReviewer?.toLowerCase() === props.fullName.toLowerCase());
        })
      );
      return () => {
        cleanupCallbacks.forEach(callback => callback && callback());
      };
    }
  }, [props.firebaseInitSuccess]);

  useEffect(() => {
    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
  }, []);

  const geneEntity: IGene | undefined = useMemo(() => {
    return props.geneEntities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.geneEntities]);

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

  return props.firebaseInitSuccess && !props.loadingGenes && !!geneName && props.drugList.length > 0 ? (
    <div>
      <Row className={'mb-2'}>
        <Col className={'d-flex justify-content-between flex-row flex-nowrap align-items-end'}>
          <GeneHeader
            firebaseGenePath={firebaseGenePath}
            geneName={geneName}
            geneEntity={geneEntity}
            isReviewing={isReviewing}
            isReviewFinished={isReviewFinished}
            handleReviewFinished={isFinished => setIsReviewFinished(isFinished)}
          />
        </Col>
      </Row>
      {isReviewing ? (
        <ReviewPage
          hugoSymbol={hugoSymbol}
          reviewFinished={isReviewFinished}
          handleReviewFinished={isFinished => setIsReviewFinished(isFinished)}
          drugList={props.drugList}
        />
      ) : (
        <>
          <Row className={`${getSectionClassName()} justify-content-between`}>
            <Col>
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
                  <>
                    <GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Summary'} />
                    <div className="mr-3" />
                    <CommentIcon id={`${hugoSymbol}_gene_summary`} path={`${firebaseGenePath}/summary_comments`} />
                  </>
                }
              />
            </Col>
          </Row>
          <Row className={'mb-5'}>
            <Col>
              <RealtimeTextAreaInput
                firebasePath={`${firebaseGenePath}/background`}
                inputClass={styles.textarea}
                label="Background"
                name="geneBackground"
                parseRefs
                labelIcon={
                  <>
                    <GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Background'} />
                    <div className="mr-3" />
                    <CommentIcon id={`${hugoSymbol}_gene_background`} path={`${firebaseGenePath}/background_comments`} />
                  </>
                }
              />
            </Col>
          </Row>
          <MutationsSection mutationsPath={`${firebaseGenePath}/mutations`} hugoSymbol={hugoSymbol} parsedHistoryList={parsedHistoryList} />
          <VusTable hugoSymbol={hugoSymbol} />
          <RelevantCancerTypesModal
            onConfirm={async (newRelevantCancerTypes, noneDeleted) => {
              try {
                if (noneDeleted) {
                  await props.setUntemplated(props.relevantCancerTypesModalStore.pathToRelevantCancerTypes, []);
                } else {
                  await props.setUntemplated(props.relevantCancerTypesModalStore.pathToRelevantCancerTypes, newRelevantCancerTypes);
                }
                props.relevantCancerTypesModalStore.closeModal();
              } catch (error) {
                notifyError(error);
              }
            }}
            onCancel={() => props.relevantCancerTypesModalStore.closeModal()}
          />
          <OncoKBSidebar>
            <Tabs
              tabs={[
                {
                  title: 'Tools',
                  content: <CurationToolsTab genePath={firebaseGenePath} />,
                },
                {
                  title: 'History',
                  content: <CurationHistoryTab historyData={props.historyData} />,
                },
                {
                  title: 'References',
                  content: <CurationReferencesTab genePath={firebaseGenePath} />,
                },
              ]}
            />
          </OncoKBSidebar>
        </>
      )}
    </div>
  ) : (
    <></>
  );
};

const mapStoreToProps = ({
  geneStore,
  firebaseStore,
  firebaseHistoryStore,
  drugStore,
  firebaseCrudStore,
  relevantCancerTypesModalStore,
  authStore,
}: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  firebaseInitSuccess: firebaseStore.firebaseInitSuccess,
  searchGeneEntities: geneStore.searchEntities,
  geneEntities: geneStore.entities,
  loadingGenes: geneStore.loading,
  historyData: firebaseHistoryStore.data,
  addHistoryListener: firebaseHistoryStore.addListener,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
  setUntemplated: firebaseCrudStore.createUntemplated,
  relevantCancerTypesModalStore,
  fullName: authStore.fullName,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
