import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ITreatmentPriorityDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentPriorityDetail = (props: ITreatmentPriorityDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const treatmentPriorityEntity = props.treatmentPriorityEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="treatmentPriorityDetailsHeading">TreatmentPriority</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{treatmentPriorityEntity.id}</dd>
          <dt>
            <span id="priority">Priority</span>
          </dt>
          <dd>{treatmentPriorityEntity.priority}</dd>
          <dt>Treatment</dt>
          <dd>{treatmentPriorityEntity.treatment ? treatmentPriorityEntity.treatment.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/treatment-priority" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/treatment-priority/${treatmentPriorityEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ treatmentPriorityStore }: IRootStore) => ({
  treatmentPriorityEntity: treatmentPriorityStore.entity,
  getEntity: treatmentPriorityStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentPriorityDetail);
