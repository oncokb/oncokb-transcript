import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { getTreatmentName } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface ITreatmentDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentDetail = (props: ITreatmentDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const treatmentEntity = props.treatmentEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="treatmentDetailsHeading">Treatment</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{treatmentEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{treatmentEntity.name}</dd>
          <dt>Drugs</dt>
          <dd>{treatmentEntity ? getTreatmentName([treatmentEntity]) : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={treatmentEntity.id}
          entityType={ENTITY_TYPE.TREATMENT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ treatmentStore }: IRootStore) => ({
  treatmentEntity: treatmentStore.entity,
  getEntity: treatmentStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentDetail);
