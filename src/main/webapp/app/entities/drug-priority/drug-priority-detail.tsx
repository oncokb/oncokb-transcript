import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IDrugPriorityDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugPriorityDetail = (props: IDrugPriorityDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugPriorityEntity = props.drugPriorityEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="drugPriorityDetailsHeading">DrugPriority</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{drugPriorityEntity.id}</dd>
          <dt>
            <span id="priority">Priority</span>
          </dt>
          <dd>{drugPriorityEntity.priority}</dd>
          <dt>Drug</dt>
          <dd>{drugPriorityEntity.drug ? drugPriorityEntity.drug.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/drug-priority" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/drug-priority/${drugPriorityEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ drugPriorityStore }: IRootStore) => ({
  drugPriorityEntity: drugPriorityStore.entity,
  getEntity: drugPriorityStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugPriorityDetail);
