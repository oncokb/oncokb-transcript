import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IEligibilityCriteriaDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EligibilityCriteriaDetail = (props: IEligibilityCriteriaDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const eligibilityCriteriaEntity = props.eligibilityCriteriaEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="eligibilityCriteriaDetailsHeading">EligibilityCriteria</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.type}</dd>
          <dt>
            <span id="priority">Priority</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.priority}</dd>
          <dt>
            <span id="criteria">Criteria</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.criteria}</dd>
          <dt>Association</dt>
          <dd>
            {eligibilityCriteriaEntity.associations
              ? eligibilityCriteriaEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {eligibilityCriteriaEntity.associations && i === eligibilityCriteriaEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Clinical Trial</dt>
          <dd>{eligibilityCriteriaEntity.clinicalTrial ? eligibilityCriteriaEntity.clinicalTrial.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/eligibility-criteria" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/eligibility-criteria/${eligibilityCriteriaEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ eligibilityCriteriaStore }: IRootStore) => ({
  eligibilityCriteriaEntity: eligibilityCriteriaStore.entity,
  getEntity: eligibilityCriteriaStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EligibilityCriteriaDetail);
