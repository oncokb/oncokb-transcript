import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ISequenceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SequenceDetail = (props: ISequenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const sequenceEntity = props.sequenceEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="sequenceDetailsHeading">Sequence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{sequenceEntity.id}</dd>
          <dt>
            <span id="sequenceType">Sequence Type</span>
          </dt>
          <dd>{sequenceEntity.sequenceType}</dd>
          <dt>
            <span id="sequence">Sequence</span>
          </dt>
          <dd>{sequenceEntity.sequence}</dd>
          <dt>Transcript</dt>
          <dd>{sequenceEntity.transcript ? sequenceEntity.transcript.id : ''}</dd>
        </dl>
        <Button tag={Link} to={`/sequence/${sequenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ sequenceStore }: IRootStore) => ({
  sequenceEntity: sequenceStore.entity,
  getEntity: sequenceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SequenceDetail);
