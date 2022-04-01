import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { byteSize, Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IFdaSubmissionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmission = (props: IFdaSubmissionProps) => {
  const fdaSubmissionList = props.fdaSubmissionList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const handleSyncList = () => {
    props.getEntities({});
  };

  const { match } = props;

  return (
    <div>
      <h2 id="fda-submission-heading" data-cy="FdaSubmissionHeading">
        Fda Submissions
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Fda Submission
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {fdaSubmissionList && fdaSubmissionList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Number</th>
                <th>Supplement Number</th>
                <th>Device Name</th>
                <th>Generic Name</th>
                <th>Date Received</th>
                <th>Decision Date</th>
                <th>Description</th>
                <th>Companion Diagnostic Device</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fdaSubmissionList.map((fdaSubmission, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${fdaSubmission.id}`} color="link" size="sm">
                      {fdaSubmission.id}
                    </Button>
                  </td>
                  <td>{fdaSubmission.number}</td>
                  <td>{fdaSubmission.supplementNumber}</td>
                  <td>{fdaSubmission.deviceName}</td>
                  <td>{fdaSubmission.genericName}</td>
                  <td>
                    {fdaSubmission.dateReceived ? (
                      <TextFormat type="date" value={fdaSubmission.dateReceived} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>
                    {fdaSubmission.decisionDate ? (
                      <TextFormat type="date" value={fdaSubmission.decisionDate} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>{fdaSubmission.description}</td>
                  <td>
                    {fdaSubmission.companionDiagnosticDevice ? (
                      <Link to={`companion-diagnostic-device/${fdaSubmission.companionDiagnosticDevice.id}`}>
                        {fdaSubmission.companionDiagnosticDevice.name}
                      </Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {fdaSubmission.type ? <Link to={`fda-submission-type/${fdaSubmission.type.id}`}>{fdaSubmission.type.type}</Link> : ''}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${fdaSubmission.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${fdaSubmission.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${fdaSubmission.id}/delete`}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Fda Submissions found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionList: fdaSubmissionStore.entities,
  loading: fdaSubmissionStore.loading,
  getEntities: fdaSubmissionStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmission);