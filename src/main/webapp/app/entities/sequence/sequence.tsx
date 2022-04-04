import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { byteSize, Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ISequence } from 'app/shared/model/sequence.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface ISequenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Sequence = (props: ISequenceProps) => {
  const sequenceList = props.sequenceList;
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
      <h2 id="sequence-heading" data-cy="SequenceHeading">
        Sequences
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Sequence
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {sequenceList && sequenceList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sequence Type</th>
                <th>Sequence</th>
                <th>Transcript</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sequenceList.map((sequence, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${sequence.id}`} color="link" size="sm">
                      {sequence.id}
                    </Button>
                  </td>
                  <td>{sequence.sequenceType}</td>
                  <td>{sequence.sequence}</td>
                  <td>{sequence.transcript ? <Link to={`transcript/${sequence.transcript.id}`}>{sequence.transcript.id}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${sequence.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${sequence.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${sequence.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Sequences found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ sequenceStore }: IRootStore) => ({
  sequenceList: sequenceStore.entities,
  loading: sequenceStore.loading,
  getEntities: sequenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Sequence);
