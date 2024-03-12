import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { RouteComponentProps } from 'react-router-dom';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import { Col, Row } from 'reactstrap';
import { getSectionClassName } from 'app/shared/util/utils';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from './input/RealtimeInputs';
import { GENE_TYPE, GENE_TYPE_KEY } from 'app/config/constants/firebase';
import styles from './styles.module.scss';
import WithSeparator from 'react-with-separator';
import { CBIOPORTAL, COSMIC, GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import { InlineDivider } from 'app/shared/links/PubmedGeneArticlesLink';
import { IGene } from 'app/shared/model/gene.model';
import { HgncLink } from 'app/shared/links/HgncLink';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { onValue, ref } from 'firebase/database';
import CommentIcon from './CommentIcon';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import RelevantCancerTypesModal from 'app/shared/modal/RelevantCancerTypesModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import MutationsSection from './MutationsSection';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

export type ParsedHistoryRecord = { record: HistoryRecord; timestamp: number; admin: string };

export const CurationPage = (props: ICurationPageProps) => {
  const hugoSymbol = props.match.params.hugoSymbol.toUpperCase();

  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);
  const firebaseHistoryPath = getFirebasePath('HISTORY', hugoSymbol);

  const [geneName, setGeneName] = useState(undefined);
  const [isReviewing, setIsReviewing] = useState(false);

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
          <div className="d-flex align-items-end all-children-margin">
            <span style={{ fontSize: '3rem', lineHeight: 1 }} className={'mr-2'}>
              {geneName}
            </span>
            {!isReviewing && (
              <>
                <CommentIcon id={`${hugoSymbol}_curation_page`} path={`${firebaseGenePath}/name_comments`} />
                <div>
                  <span>
                    {geneEntity?.entrezGeneId && (
                      <span className="ml-2">
                        <span className="font-weight-bold text-nowrap">Entrez Gene:</span>
                        <span className="ml-1">
                          <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
                        </span>
                      </span>
                    )}
                    {geneEntity?.hgncId && (
                      <span className="ml-2">
                        <span className="font-weight-bold">HGNC:</span>
                        <span className="ml-1">
                          <HgncLink id={geneEntity.hgncId} />
                        </span>
                      </span>
                    )}
                    {geneEntity?.synonyms && geneEntity.synonyms.length > 0 && (
                      <span className="ml-2">
                        <span className="font-weight-bold">Gene aliases:</span>
                        <span className="ml-1">
                          <WithSeparator separator={', '}>
                            {geneEntity.synonyms.map(synonym => (
                              <span className={'text-nowrap'} key={synonym.name}>
                                {synonym.name}
                              </span>
                            ))}
                          </WithSeparator>
                        </span>
                      </span>
                    )}
                    <span className="ml-2">
                      <span className="font-weight-bold mr-2">External Links:</span>
                      <WithSeparator separator={InlineDivider}>
                        <a href={`https://cbioportal.mskcc.org/ln?q=${geneName}`} target="_blank" rel="noopener noreferrer">
                          {CBIOPORTAL} <ExternalLinkIcon />
                        </a>
                        <a
                          href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${geneName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {COSMIC} <ExternalLinkIcon />
                        </a>
                      </WithSeparator>
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>
          {/* {getReviewButtons()} */}
        </Col>
      </Row>
      <Row className={`${getSectionClassName()} justify-content-between`}>
        <Col>
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span className="mr-2">Gene Type</span>
                {/* {<GeneHistoryTooltip historyData={parsedHistoryList} location={'Gene Type'} />} */}
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
  firebaseVusStore,
  relevantCancerTypesModalStore,
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
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
