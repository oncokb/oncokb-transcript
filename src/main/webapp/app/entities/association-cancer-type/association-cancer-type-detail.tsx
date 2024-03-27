import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

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
        <EntityActionButton
          color="primary"
          entityId={associationCancerTypeEntity.id}
          entityType={ENTITY_TYPE.ASSOCIATION_CANCER_TYPE}
          entityAction={ENTITY_ACTION.EDIT}
        />
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
