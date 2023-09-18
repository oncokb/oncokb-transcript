import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { Else, If, Then } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { REFERENCE_GENOME } from 'app/config/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getSectionClassName } from 'app/shared/util/utils';
import { ONCOGENE, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeBasicInput, RealtimeInputType } from 'app/shared/firebase/FirebaseRealtimeInput';
import GeneTranscriptInfoInput from '../../shared/firebase/GeneTranscriptInfoInput';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';

export interface ICurationPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

const CurationPage = (props: ICurationPageProps) => {
  const hugoSymbol = props.match.params.hugoSymbol;
  const firebaseGenePath = getFirebasePath('GENE', hugoSymbol);

  useEffect(() => {
    props.searchEntities({ query: hugoSymbol });
    const cleanupCallbacks = [];
    cleanupCallbacks.push(props.addListener(firebaseGenePath));
    cleanupCallbacks.push(props.addMetaListener(getFirebasePath('META_COLLABORATORS')));
    cleanupCallbacks.push(() => props.updateCollaborator(hugoSymbol, false));
    return () => cleanupCallbacks.forEach(callback => callback && callback());
  }, []);

  const geneEntity = useMemo(() => {
    return props.entities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [props.entities]);

  useEffect(() => {
    if (props.metaData && props.data?.name) {
      props.updateCollaborator(props.data.name, true);
    }
  }, [props.metaData, props.data]);

  return (
    <If condition={!!props.data && !!geneEntity}>
      <Then>
        <div>
          <Row>
            <Col>
              <h2>Gene: {props.data?.name}</h2>
            </Col>
          </Row>
          <Row className={`${getSectionClassName()} justify-content-between`}>
            <Col md={6}>
              <div className="mb-2">
                <span className="font-weight-bold">Entrez Gene:</span>
                <span className="ml-1">
                  <PubmedGeneLink entrezGeneId={geneEntity?.entrezGeneId} />
                </span>
              </div>
              <div className="mb-4">
                <span className="font-weight-bold">Gene aliases:</span>
                <span className="ml-1">
                  <PubmedGeneArticlesLink hugoSymbols={geneEntity?.geneAliases?.map(alias => alias.name)} />
                </span>
              </div>
              <div className="mb-4">
                <GeneTranscriptInfoInput
                  referenceGenome={REFERENCE_GENOME.GRCH37}
                  isoform={props.data?.isoform_override}
                  refseq={props.data?.dmp_refseq_id}
                  onIsoformChange={e => {
                    props.updateReviewableContent(firebaseGenePath, 'isoform_override', e.target.value);
                  }}
                  onRefseqChange={e => {
                    props.updateReviewableContent(firebaseGenePath, 'dmp_refseq_id', e.target.value);
                  }}
                />
                <GeneTranscriptInfoInput
                  referenceGenome={REFERENCE_GENOME.GRCH38}
                  isoform={props.data?.isoform_override_grch38}
                  refseq={props.data?.dmp_refseq_id_grch38}
                  onIsoformChange={e => {
                    props.updateReviewableContent(firebaseGenePath, 'isoform_override_grch38', e.target.value);
                  }}
                  onRefseqChange={e => {
                    props.updateReviewableContent(firebaseGenePath, 'dmp_refseq_id_grch38', e.target.value);
                  }}
                />
              </div>
              <RealtimeBasicInput
                label="Summary"
                labelClass="font-weight-bold"
                name="geneSummary"
                type={RealtimeInputType.TEXTAREA}
                value={props.data?.summary || ''}
                onChange={e => {
                  props.updateReviewableContent(firebaseGenePath, 'summary', e.target.value);
                }}
              />
              <div className="flex d-flex">
                <RealtimeBasicInput
                  label="Tumor Supressor"
                  name="tumorSupressor"
                  type={RealtimeInputType.CHECKBOX}
                  checked={!!props.data?.type?.tsg}
                  onChange={e => {
                    props.updateGeneType(firebaseGenePath, TUMOR_SUPPRESSOR, e.target.checked);
                  }}
                />
                <RealtimeBasicInput
                  className="ml-4"
                  label="Oncogene"
                  name="oncogene"
                  type={RealtimeInputType.CHECKBOX}
                  checked={!!props.data?.type?.ocg}
                  onChange={e => {
                    props.updateGeneType(firebaseGenePath, ONCOGENE, e.target.checked);
                  }}
                />
              </div>
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <RealtimeBasicInput
                label="Background"
                labelClass="font-weight-bold"
                name="geneBackground"
                type={RealtimeInputType.TEXTAREA}
                value={props.data?.background || ''}
                onChange={e => {
                  props.updateReviewableContent(firebaseGenePath, 'background', e.target.value);
                }}
              />
              <div className="mb-2">
                <AutoParseRefField summary={props.data?.background} />
              </div>
              <div>
                <span className="font-weight-bold mr-2">External Links:</span>
                <WithSeparator separator={InlineDivider}>
                  <a href={`https://cbioportal.mskcc.org/ln?q=${props.data?.name}`} target="_blank" rel="noopener noreferrer">
                    CBioPortal <ExternalLinkIcon />
                  </a>
                  <a
                    href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${props.data?.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cosmic <ExternalLinkIcon />
                  </a>
                </WithSeparator>
              </div>
            </Col>
          </Row>
        </div>
      </Then>
      <Else>
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
      </Else>
    </If>
  );
};

const mapStoreToProps = ({ geneStore, firebaseGeneStore, firebaseMetaStore, authStore }: IRootStore) => ({
  searchEntities: geneStore.searchEntities,
  entities: geneStore.entities,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
  addMetaListener: firebaseMetaStore.addListener,
  updateGeneType: firebaseGeneStore.updateGeneType,
  metaData: firebaseMetaStore.data,
  updateCollaborator: firebaseMetaStore.updateCollaborator,
  account: authStore.account,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPage);
