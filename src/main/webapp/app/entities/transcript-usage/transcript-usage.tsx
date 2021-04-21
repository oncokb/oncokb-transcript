import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './transcript-usage.reducer';
import { ITranscriptUsage } from 'app/shared/model/transcript-usage.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITranscriptUsageProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const TranscriptUsage = (props: ITranscriptUsageProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { transcriptUsageList, match, loading } = props;
  return (
    <div>
      <h2 id="transcript-usage-heading" data-cy="TranscriptUsageHeading">
        Transcript Usages
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Transcript Usage
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {transcriptUsageList && transcriptUsageList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Source</th>
                <th>Transcript</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transcriptUsageList.map((transcriptUsage, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${transcriptUsage.id}`} color="link" size="sm">
                      {transcriptUsage.id}
                    </Button>
                  </td>
                  <td>{transcriptUsage.source}</td>
                  <td>
                    {transcriptUsage.transcript ? (
                      <Link to={`transcript/${transcriptUsage.transcript.id}`}>{transcriptUsage.transcript.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${transcriptUsage.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${transcriptUsage.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${transcriptUsage.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Transcript Usages found</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ transcriptUsage }: IRootState) => ({
  transcriptUsageList: transcriptUsage.entities,
  loading: transcriptUsage.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptUsage);
