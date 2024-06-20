import EntityActionButton from 'app/shared/button/EntityActionButton';
import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import FlagBadge from 'app/shared/badge/FlagBadge';

export interface ITranscriptDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TranscriptDetail = (props: ITranscriptDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const transcriptEntity = props.transcriptEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="transcriptDetailsHeading">Transcript</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{transcriptEntity.id}</dd>
          <dt>
            <span id="referenceGenome">Reference Genome</span>
          </dt>
          <dd>{transcriptEntity.referenceGenome}</dd>
          <dt>
            <span id="ensemblTranscriptId">Ensembl Transcript Id</span>
          </dt>
          <dd>{transcriptEntity.ensemblTranscriptId}</dd>
          <dt>
            <span id="canonical">Canonical</span>
          </dt>
          <dd>{transcriptEntity.canonical ? 'true' : 'false'}</dd>
          <dt>
            <span id="ensemblProteinId">Ensembl Protein Id</span>
          </dt>
          <dd>{transcriptEntity.ensemblProteinId}</dd>
          <dt>
            <span id="referenceSequenceId">Reference Sequence Id</span>
          </dt>
          <dd>{transcriptEntity.referenceSequenceId}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{transcriptEntity.description}</dd>
          <dt>Flag</dt>
          <dd>
            {transcriptEntity.flags
              ? transcriptEntity.flags.map((val, i) => <FlagBadge key={`${val.id}`} flag={val} tagClassName={'me-2'} />)
              : null}
          </dd>
          {transcriptEntity.ensemblGene && (
            <>
              <dt>Ensembl Gene</dt>
              <dd>{transcriptEntity.ensemblGene.ensemblGeneId}</dd>
              <dt>Gene</dt>
              <dd>{transcriptEntity.ensemblGene.gene?.hugoSymbol}</dd>
            </>
          )}
        </dl>
        <EntityActionButton
          color="primary"
          entityId={transcriptEntity.id}
          entityType={ENTITY_TYPE.TRANSCRIPT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ transcriptStore }: IRootStore) => ({
  transcriptEntity: transcriptStore.entity,
  getEntity: transcriptStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<ITranscriptDetailProps, StoreProps>(mapStoreToProps)(TranscriptDetail);
