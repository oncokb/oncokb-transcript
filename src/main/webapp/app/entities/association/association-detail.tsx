import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

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
        <EntityActionButton
          color="primary"
          entityId={associationEntity.id}
          entityType={ENTITY_TYPE.ASSOCIATION}
          entityAction={ENTITY_ACTION.EDIT}
        />
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
