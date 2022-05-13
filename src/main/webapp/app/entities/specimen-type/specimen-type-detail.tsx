import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ISpecimenTypeDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SpecimenTypeDetail = (props: ISpecimenTypeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const specimenTypeEntity = props.specimenTypeEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="specimenTypeDetailsHeading">SpecimenType</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{specimenTypeEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{specimenTypeEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{specimenTypeEntity.name}</dd>
        </dl>
        <Button tag={Link} to={`/specimen-type/${specimenTypeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ specimenTypeStore }: IRootStore) => ({
  specimenTypeEntity: specimenTypeStore.entity,
  getEntity: specimenTypeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SpecimenTypeDetail);
