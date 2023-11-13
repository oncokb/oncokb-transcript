import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IAssociationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AssociationDetail = (props: IAssociationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const associationEntity = props.associationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="associationDetailsHeading">Association</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{associationEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{associationEntity.name}</dd>
          <dt>Alteration</dt>
          <dd>
            {associationEntity.alterations
              ? associationEntity.alterations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {associationEntity.alterations && i === associationEntity.alterations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Article</dt>
          <dd>
            {associationEntity.articles
              ? associationEntity.articles.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {associationEntity.articles && i === associationEntity.articles.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Treatment</dt>
          <dd>
            {associationEntity.treatments
              ? associationEntity.treatments.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {associationEntity.treatments && i === associationEntity.treatments.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/association" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/association/${associationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ associationStore }: IRootStore) => ({
  associationEntity: associationStore.entity,
  getEntity: associationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationDetail);
