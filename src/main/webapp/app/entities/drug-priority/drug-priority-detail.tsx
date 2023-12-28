import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

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
        <EntityActionButton
          color="primary"
          entityId={drugPriorityEntity.id}
          entityType={ENTITY_TYPE.DRUG_PRIORITY}
          entityAction={ENTITY_ACTION.EDIT}
        />
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
