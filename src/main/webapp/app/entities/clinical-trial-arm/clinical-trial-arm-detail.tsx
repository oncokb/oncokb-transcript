import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IClinicalTrialArmDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialArmDetail = (props: IClinicalTrialArmDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const clinicalTrialArmEntity = props.clinicalTrialArmEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="clinicalTrialArmDetailsHeading">ClinicalTrialArm</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{clinicalTrialArmEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{clinicalTrialArmEntity.name}</dd>
          <dt>Association</dt>
          <dd>
            {clinicalTrialArmEntity.associations
              ? clinicalTrialArmEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {clinicalTrialArmEntity.associations && i === clinicalTrialArmEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Clinical Trial</dt>
          <dd>{clinicalTrialArmEntity.clinicalTrial ? clinicalTrialArmEntity.clinicalTrial.id : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={clinicalTrialArmEntity.id}
          entityType={ENTITY_TYPE.CLINICAL_TRIAL_ARM}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ clinicalTrialArmStore }: IRootStore) => ({
  clinicalTrialArmEntity: clinicalTrialArmStore.entity,
  getEntity: clinicalTrialArmStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IClinicalTrialArmDetailProps, StoreProps>(mapStoreToProps)(ClinicalTrialArmDetail);
