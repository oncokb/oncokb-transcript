import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IClinicalTrialDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialDetail = (props: IClinicalTrialDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const clinicalTrialEntity = props.clinicalTrialEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="clinicalTrialDetailsHeading">ClinicalTrial</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{clinicalTrialEntity.id}</dd>
          <dt>
            <span id="nctId">Nct Id</span>
          </dt>
          <dd>{clinicalTrialEntity.nctId}</dd>
          <dt>
            <span id="briefTitle">Brief Title</span>
          </dt>
          <dd>{clinicalTrialEntity.briefTitle}</dd>
          <dt>
            <span id="phase">Phase</span>
          </dt>
          <dd>{clinicalTrialEntity.phase}</dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{clinicalTrialEntity.status}</dd>
          <dt>Association</dt>
          <dd>
            {clinicalTrialEntity.associations
              ? clinicalTrialEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {clinicalTrialEntity.associations && i === clinicalTrialEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={clinicalTrialEntity.id}
          entityType={ENTITY_TYPE.CLINICAL_TRIAL}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ clinicalTrialStore }: IRootStore) => ({
  clinicalTrialEntity: clinicalTrialStore.entity,
  getEntity: clinicalTrialStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IClinicalTrialDetailProps, StoreProps>(mapStoreToProps)(ClinicalTrialDetail);
