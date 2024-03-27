import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface ITreatmentPriorityDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentPriorityDetail = (props: ITreatmentPriorityDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const treatmentPriorityEntity = props.treatmentPriorityEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="treatmentPriorityDetailsHeading">TreatmentPriority</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{treatmentPriorityEntity.id}</dd>
          <dt>
            <span id="priority">Priority</span>
          </dt>
          <dd>{treatmentPriorityEntity.priority}</dd>
          <dt>Treatment</dt>
          <dd>{treatmentPriorityEntity.treatment ? treatmentPriorityEntity.treatment.id : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={treatmentPriorityEntity.id}
          entityType={ENTITY_TYPE.TREATMENT_PRIORITY}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ treatmentPriorityStore }: IRootStore) => ({
  treatmentPriorityEntity: treatmentPriorityStore.entity,
  getEntity: treatmentPriorityStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentPriorityDetail);
