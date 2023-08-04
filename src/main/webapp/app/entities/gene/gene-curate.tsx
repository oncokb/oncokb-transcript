import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { Else, If, Then } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { FirebaseCollectionName, REFERENCE_GENOME } from 'app/config/constants';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { InlineDivider, PubmedGeneArticlesLink } from 'app/shared/links/PubmedGeneArticlesLink';
import { getSectionClassName } from 'app/shared/util/utils';
import { Gene, ONCOGENE, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';
import { DefaultField } from 'app/shared/form/DefaultField';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';

const ReferenceGenomeInput: React.FunctionComponent<{
  referenceGenome: REFERENCE_GENOME;
  isoform: string;
  refseq: string;
  onIsoformChange: (event) => void;
  onRefseqChange: (event) => void;
}> = props => {
  return (
    <Row>
      <Col>
        <ValidatedField
          name={'isoform'}
          label={`${props.referenceGenome} Isoform`}
          labelClass="font-weight-bold"
          inputClass="h-25 p-1"
          value={props.isoform || ''}
          onChange={props.onIsoformChange}
        />
      </Col>
      <Col>
        <ValidatedField
          name={'refseq'}
          label={`${props.referenceGenome} RefSeq`}
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
    let unsubscribe = undefined;
    props.getEntity(props.match.params.id).then(result => {
      unsubscribe = props.addListener(`${FirebaseCollectionName.GENES}/${result.data.hugoSymbol}/`);
    });
    if (unsubscribe) {
      return () => unsubscribe();
    }
  }, []);

  const handleTumorSuppressorChange = (checked: boolean) => {
    props.update(firebaseParentPath, { type: { tsg: checked ? TUMOR_SUPPRESSOR : '' } });
  };

  const handleOncogeneChange = (checked: boolean) => {
    props.update(firebaseParentPath, { type: { ocg: checked ? ONCOGENE : '' } });
  };

  const handleIsoformChange = (referenceGenome: REFERENCE_GENOME, value: string) => {
    const updateObj: Partial<Gene> =
      referenceGenome === REFERENCE_GENOME.GRCH37 ? { isoform_override: value } : { isoform_override_grch38: value };
    props.update(firebaseParentPath, updateObj);
  };

  const handleRefseqChange = (referenceGenome: REFERENCE_GENOME, value: string) => {
    const updateObj: Partial<Gene> =
      referenceGenome === REFERENCE_GENOME.GRCH37 ? { dmp_refseq_id: value } : { dmp_refseq_id_grch38: value };
    props.update(firebaseParentPath, updateObj);
  };

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
                <ReferenceGenomeInput
                  referenceGenome={REFERENCE_GENOME.GRCH37}
                  isoform={props.data?.isoform_override}
                  refseq={props.data?.dmp_refseq_id}
                  onIsoformChange={event => {
                    handleIsoformChange(REFERENCE_GENOME.GRCH37, event.target.value);
                  }}
                  onRefseqChange={event => {
                    handleRefseqChange(REFERENCE_GENOME.GRCH37, event.target.value);
                  }}
                />
                <ReferenceGenomeInput
                  referenceGenome={REFERENCE_GENOME.GRCH38}
                  isoform={props.data?.isoform_override_grch38}
                  refseq={props.data?.dmp_refseq_id_grch38}
                  onIsoformChange={event => {
                    handleIsoformChange(REFERENCE_GENOME.GRCH38, event.target.value);
                  }}
                  onRefseqChange={event => {
                    handleRefseqChange(REFERENCE_GENOME.GRCH38, event.target.value);
                  }}
                />
              </div>
              <DefaultField
                label="Summary"
                labelClass="font-weight-bold"
                name="geneSummary"
                type="textarea"
                value={props.data?.summary || ''}
                onChange={event => {
                  props.update(firebaseParentPath, { summary: event.target.value });
                }}
              />
              <div className="mb-2 d-flex">
                <DefaultField
                  name="type"
                  type="checkbox"
                  label="Tumor Supressor"
                  inputClass="ml-1 position-relative"
                  checked={!!props.data?.type?.tsg}
                  onChange={e => {
                    handleTumorSuppressorChange(e.target.checked);
                  }}
                />
                <DefaultField
                  className="ml-4"
                  name="type"
                  type="checkbox"
                  label="Oncogene"
                  inputClass="ml-1 position-relative"
                  checked={!!props.data?.type?.ocg}
                  onChange={e => {
                    handleOncogeneChange(e.target.checked);
                  }}
                />
              </div>
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <DefaultField
                className="mb-1"
                label="Background"
                labelClass="font-weight-bold"
                name="geneBackground"
                type="textarea"
                value={props.data?.background || ''}
                rows={Math.ceil(props.data?.background.length / 250)}
                onChange={event => {
                  props.update(firebaseParentPath, { background: event.target.value });
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

const mapStoreToProps = ({ geneStore, firebaseGeneStore }: IRootStore) => ({
  geneEntity: geneStore.entity,
  loading: geneStore.loading,
  getEntity: geneStore.getEntity,
  addListener: firebaseGeneStore.addListener,
  data: firebaseGeneStore.data,
  update: firebaseGeneStore.update,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneCurate);
