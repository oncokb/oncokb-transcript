import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        <Button tag={Link} to="/clinical-trial" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/clinical-trial/${clinicalTrialEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ clinicalTrialStore }: IRootStore) => ({
  clinicalTrialEntity: clinicalTrialStore.entity,
  getEntity: clinicalTrialStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialDetail);
