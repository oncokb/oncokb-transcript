import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './transcript.reducer';
import { ITranscript } from 'app/shared/model/transcript.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITranscriptProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const Transcript = (props: ITranscriptProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { transcriptList, match, loading } = props;
  return (
    <div>
      <h2 id="transcript-heading" data-cy="TranscriptHeading">
        Transcripts
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Transcript
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {transcriptList && transcriptList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Entrez Gene Id</th>
                <th>Hugo Symbol</th>
                <th>Reference Genome</th>
                <th>Ensembl Transcript Id</th>
                <th>Ensembl Protein Id</th>
                <th>Reference Sequence Id</th>
                <th>Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transcriptList.map((transcript, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${transcript.id}`} color="link" size="sm">
                      {transcript.id}
                    </Button>
                  </td>
                  <td>{transcript.entrezGeneId}</td>
                  <td>{transcript.hugoSymbol}</td>
                  <td>{transcript.referenceGenome}</td>
                  <td>{transcript.ensemblTranscriptId}</td>
                  <td>{transcript.ensemblProteinId}</td>
                  <td>{transcript.referenceSequenceId}</td>
                  <td>{transcript.description}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${transcript.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${transcript.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${transcript.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Transcripts found</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ transcript }: IRootState) => ({
  transcriptList: transcript.entities,
  loading: transcript.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Transcript);
