import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { getTreatmentName } from 'app/shared/util/utils';
export interface ITreatmentDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentDetail = (props: ITreatmentDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const treatmentEntity = props.treatmentEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="treatmentDetailsHeading">Treatment</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{treatmentEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{treatmentEntity.name}</dd>
          <dt>Drugs</dt>
          <dd>{treatmentEntity ? getTreatmentName([treatmentEntity]) : ''}</dd>
        </dl>
        <Button tag={Link} to="/treatment" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/treatment/${treatmentEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ treatmentStore }: IRootStore) => ({
  treatmentEntity: treatmentStore.entity,
  getEntity: treatmentStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentDetail);
