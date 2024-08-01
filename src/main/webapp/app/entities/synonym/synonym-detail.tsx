import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface ISynonymDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SynonymDetail = (props: ISynonymDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const synonymEntity = props.synonymEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="synonymDetailsHeading">Synonym</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{synonymEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{synonymEntity.type}</dd>
          <dt>
            <span id="source">Source</span>
          </dt>
          <dd>{synonymEntity.source}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{synonymEntity.code}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{synonymEntity.name}</dd>
          <dt>
            <span id="note">Note</span>
          </dt>
          <dd>{synonymEntity.note}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={synonymEntity.id}
          entityType={ENTITY_TYPE.SYNONYM}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ synonymStore }: IRootStore) => ({
  synonymEntity: synonymStore.entity,
  getEntity: synonymStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SynonymDetail);
