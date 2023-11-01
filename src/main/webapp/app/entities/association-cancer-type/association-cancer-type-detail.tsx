import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IAssociationCancerTypeDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AssociationCancerTypeDetail = (props: IAssociationCancerTypeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const associationCancerTypeEntity = props.associationCancerTypeEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="associationCancerTypeDetailsHeading">AssociationCancerType</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{associationCancerTypeEntity.id}</dd>
          <dt>
            <span id="relation">Relation</span>
          </dt>
          <dd>{associationCancerTypeEntity.relation}</dd>
          <dt>Association</dt>
          <dd>{associationCancerTypeEntity.association ? associationCancerTypeEntity.association.id : ''}</dd>
          <dt>Cancer Type</dt>
          <dd>{associationCancerTypeEntity.cancerType ? associationCancerTypeEntity.cancerType.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/association-cancer-type" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/association-cancer-type/${associationCancerTypeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ associationCancerTypeStore }: IRootStore) => ({
  associationCancerTypeEntity: associationCancerTypeStore.entity,
  getEntity: associationCancerTypeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationCancerTypeDetail);
