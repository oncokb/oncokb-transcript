import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
          <dt>Ensembl Gene</dt>
          <dd>{transcriptEntity.ensemblGene ? transcriptEntity.ensemblGene.id : ''}</dd>
        </dl>
        <Button tag={Link} to={`/transcript/${transcriptEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ transcriptStore }: IRootStore) => ({
  transcriptEntity: transcriptStore.entity,
  getEntity: transcriptStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TranscriptDetail);
