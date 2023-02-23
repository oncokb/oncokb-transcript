import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { getCancerTypeName } from 'app/shared/util/utils';
export interface IClinicalTrialsGovConditionDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialsGovConditionDetail = (props: IClinicalTrialsGovConditionDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const clinicalTrialsGovConditionEntity = props.clinicalTrialsGovConditionEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="clinicalTrialsGovConditionDetailsHeading">CT.gov Condition</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{clinicalTrialsGovConditionEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{clinicalTrialsGovConditionEntity.name}</dd>
          <dt>Cancer Type</dt>
          <dd>
            {clinicalTrialsGovConditionEntity.cancerTypes
              ? clinicalTrialsGovConditionEntity.cancerTypes.map((val, i) => (
                  <span key={val.id}>
                    <a>{getCancerTypeName(val)}</a>
                    {clinicalTrialsGovConditionEntity.cancerTypes && i === clinicalTrialsGovConditionEntity.cancerTypes.length - 1
                      ? ''
                      : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/clinical-trials-gov-condition" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/clinical-trials-gov-condition/${clinicalTrialsGovConditionEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ clinicalTrialsGovConditionStore }: IRootStore) => ({
  clinicalTrialsGovConditionEntity: clinicalTrialsGovConditionStore.entity,
  getEntity: clinicalTrialsGovConditionStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialsGovConditionDetail);
