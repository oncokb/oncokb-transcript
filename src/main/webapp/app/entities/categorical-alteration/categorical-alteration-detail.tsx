import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface ICategoricalAlterationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CategoricalAlterationDetail = (props: ICategoricalAlterationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const categoricalAlterationEntity = props.categoricalAlterationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="categoricalAlterationDetailsHeading">CategoricalAlteration</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{categoricalAlterationEntity.id}</dd>
          <dt>
            <span id="alterationType">Alteration Type</span>
          </dt>
          <dd>{categoricalAlterationEntity.alterationType}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{categoricalAlterationEntity.type}</dd>
          <dt>
            <span id="consequence">Consequence</span>
          </dt>
          <dd>{categoricalAlterationEntity.consequence ? categoricalAlterationEntity.consequence.term : ''}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{categoricalAlterationEntity.name}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={categoricalAlterationEntity.id}
          entityType={ENTITY_TYPE.CATEGORICAL_ALTERATION}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ categoricalAlterationStore }: IRootStore) => ({
  categoricalAlterationEntity: categoricalAlterationStore.entity,
  getEntity: categoricalAlterationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlterationDetail);
