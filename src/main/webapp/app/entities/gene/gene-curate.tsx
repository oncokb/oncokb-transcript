import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { Else, If, Then } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { FirebaseCollectionName, REFERENCE_GENOME } from 'app/config/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getSectionClassName } from 'app/shared/util/utils';
import { ONCOGENE, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { RealtimeBasicInput, RealtimeInputType } from 'app/shared/firebase/FirebaseRealtimeInput';

const GeneTranscriptInput: React.FunctionComponent<{
  referenceGenome: REFERENCE_GENOME;
  isoform: string;
  refseq: string;
  onIsoformChange: (event) => void;
  onRefseqChange: (event) => void;
}> = props => {
  return (
    <Row>
      <Col>
        <RealtimeBasicInput
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          type={RealtimeInputType.TEXT}
          labelClass="font-weight-bold"
          inputClass="h-25 p-1"
          value={props.isoform || ''}
          onChange={props.onIsoformChange}
        />
      </Col>
      <Col>
        <RealtimeBasicInput
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          type={RealtimeInputType.TEXT}
          labelClass="font-weight-bold"
          inputClass="h-25 p-1"
          value={props.refseq || ''}
          onChange={props.onRefseqChange}
        />
      </Col>
    </Row>
  );
};

export interface IGeneCurateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneCurate = (props: IGeneCurateProps) => {
  const firebaseParentPath = `${FirebaseCollectionName.GENES}/${props.geneEntity.hugoSymbol}`;

  useEffect(() => {
    const cleanupCallbacks = [];
    props.getEntity(props.match.params.id).then(result => {
      cleanupCallbacks.push(props.addListener(`${FirebaseCollectionName.GENES}/${result.data.hugoSymbol}/`));
      cleanupCallbacks.push(props.addMetaListener(`${FirebaseCollectionName.META}/collaborators/`));
      cleanupCallbacks.push(() => props.updateCollaborator(result.data.hugoSymbol, false));
    });
    return () => cleanupCallbacks.forEach(callback => callback && callback());
  }, []);

  useEffect(() => {
    if (props.metaData && props.data?.name) {
      props.updateCollaborator(props.data.name, true);
    }
  }, [props.metaData, props.data]);

  return (
    <If condition={!props.loading && !!props.data}>
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
                  <PubmedGeneLink entrezGeneId={props.geneEntity.entrezGeneId} />
                </span>
              </div>
              <div className="mb-4">
                <span className="font-weight-bold">Gene aliases:</span>
                <span className="ml-1">
                  <PubmedGeneArticlesLink hugoSymbols={props.geneEntity.geneAliases?.map(alias => alias.name)} />
                </span>
              </div>
              <div className="mb-4">
                <GeneTranscriptInput
                  referenceGenome={REFERENCE_GENOME.GRCH37}
                  isoform={props.data?.isoform_override}
                  refseq={props.data?.dmp_refseq_id}
                  onIsoformChange={e => {
                    props.updateReviewableContent(firebaseParentPath, 'isoform_override', e.target.value);
                  }}
                  onRefseqChange={e => {
                    props.updateReviewableContent(firebaseParentPath, 'dmp_refseq_id', e.target.value);
                  }}
                />
                <GeneTranscriptInput
                  referenceGenome={REFERENCE_GENOME.GRCH38}
                  isoform={props.data?.isoform_override_grch38}
                  refseq={props.data?.dmp_refseq_id_grch38}
                  onIsoformChange={e => {
                    props.updateReviewableContent(firebaseParentPath, 'isoform_override_grch38', e.target.value);
                  }}
                  onRefseqChange={e => {
                    props.updateReviewableContent(firebaseParentPath, 'dmp_refseq_id_grch38', e.target.value);
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
                  props.updateReviewableContent(firebaseParentPath, 'summary', e.target.value);
                }}
              />
              <div className="mb-2 d-flex">
                <RealtimeBasicInput
                  label="Tumor Supressor"
                  name="tumorSupressor"
                  type={RealtimeInputType.CHECKBOX}
                  inputClass="ml-1 position-relative"
                  checked={!!props.data?.type?.tsg}
                  onChange={e => {
                    props.updateGeneType(firebaseParentPath, TUMOR_SUPPRESSOR, e.target.checked);
                  }}
                />
                <RealtimeBasicInput
                  className="ml-4"
                  label="Oncogene"
                  name="oncogene"
                  type={RealtimeInputType.CHECKBOX}
                  inputClass="ml-1 position-relative"
                  checked={!!props.data?.type?.ocg}
                  onChange={e => {
                    props.updateGeneType(firebaseParentPath, ONCOGENE, e.target.checked);
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
                  props.updateReviewableContent(firebaseParentPath, 'background', e.target.value);
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
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading={props.loading} />
      </Else>
    </If>
  );
};

const mapStoreToProps = ({ geneStore, firebaseGeneStore, firebaseMetaStore, authStore }: IRootStore) => ({
  geneEntity: geneStore.entity,
  loading: geneStore.loading,
  getEntity: geneStore.getEntity,
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

export default connect(mapStoreToProps)(GeneCurate);
