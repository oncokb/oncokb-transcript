import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        <Button tag={Link} to="/clinical-trial-arm" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/clinical-trial-arm/${clinicalTrialArmEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ clinicalTrialArmStore }: IRootStore) => ({
  clinicalTrialArmEntity: clinicalTrialArmStore.entity,
  getEntity: clinicalTrialArmStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialArmDetail);
