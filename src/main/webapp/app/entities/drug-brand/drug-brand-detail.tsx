import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IDrugBrandDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugBrandDetail = (props: IDrugBrandDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugBrandEntity = props.drugBrandEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="drugBrandDetailsHeading">Drug Brand</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{drugBrandEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{drugBrandEntity.name}</dd>
          <dt>
            <span id="region">Region</span>
          </dt>
          <dd>{drugBrandEntity.region}</dd>
          <dt>Drug</dt>
          <dd>{drugBrandEntity.drug ? drugBrandEntity.drug.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/drug-brand" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/drug-brand/${drugBrandEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ drugBrandStore }: IRootStore) => ({
  drugBrandEntity: drugBrandStore.entity,
  getEntity: drugBrandStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugBrandDetail);
