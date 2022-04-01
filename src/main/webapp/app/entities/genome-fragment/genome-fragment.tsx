import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IGenomeFragmentProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const GenomeFragment = (props: IGenomeFragmentProps) => {
  const genomeFragmentList = props.genomeFragmentList;
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
      <h2 id="genome-fragment-heading" data-cy="GenomeFragmentHeading">
        Genome Fragments
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Genome Fragment
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {genomeFragmentList && genomeFragmentList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Chromosome</th>
                <th>Start</th>
                <th>End</th>
                <th>Strand</th>
                <th>Type</th>
                <th>Transcript</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {genomeFragmentList.map((genomeFragment, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${genomeFragment.id}`} color="link" size="sm">
                      {genomeFragment.id}
                    </Button>
                  </td>
                  <td>{genomeFragment.chromosome}</td>
                  <td>{genomeFragment.start}</td>
                  <td>{genomeFragment.end}</td>
                  <td>{genomeFragment.strand}</td>
                  <td>{genomeFragment.type}</td>
                  <td>
                    {genomeFragment.transcript ? (
                      <Link to={`transcript/${genomeFragment.transcript.id}`}>{genomeFragment.transcript.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${genomeFragment.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${genomeFragment.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${genomeFragment.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Genome Fragments found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ genomeFragmentStore }: IRootStore) => ({
  genomeFragmentList: genomeFragmentStore.entities,
  loading: genomeFragmentStore.loading,
  getEntities: genomeFragmentStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomeFragment);
