import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IFdaSubmissionDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionDetail = (props: IFdaSubmissionDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaSubmissionEntity = props.fdaSubmissionEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fdaSubmissionDetailsHeading">FdaSubmission</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fdaSubmissionEntity.id}</dd>
          <dt>
            <span id="number">Number</span>
          </dt>
          <dd>{fdaSubmissionEntity.number}</dd>
          <dt>
            <span id="supplementNumber">Supplement Number</span>
          </dt>
          <dd>{fdaSubmissionEntity.supplementNumber}</dd>
          <dt>
            <span id="deviceName">Device Name</span>
          </dt>
          <dd>{fdaSubmissionEntity.deviceName}</dd>
          <dt>
            <span id="genericName">Generic Name</span>
          </dt>
          <dd>{fdaSubmissionEntity.genericName}</dd>
          <dt>
            <span id="dateReceived">Date Received</span>
          </dt>
          <dd>
            {fdaSubmissionEntity.dateReceived ? (
              <TextFormat value={fdaSubmissionEntity.dateReceived} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="decisionDate">Decision Date</span>
          </dt>
          <dd>
            {fdaSubmissionEntity.decisionDate ? (
              <TextFormat value={fdaSubmissionEntity.decisionDate} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{fdaSubmissionEntity.description}</dd>
          <dt>Companion Diagnostic Device</dt>
          <dd>{fdaSubmissionEntity.companionDiagnosticDevice ? fdaSubmissionEntity.companionDiagnosticDevice.id : ''}</dd>
          <dt>Type</dt>
          <dd>{fdaSubmissionEntity.type ? fdaSubmissionEntity.type.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/fda-submission" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/fda-submission/${fdaSubmissionEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionEntity: fdaSubmissionStore.entity,
  getEntity: fdaSubmissionStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionDetail);
