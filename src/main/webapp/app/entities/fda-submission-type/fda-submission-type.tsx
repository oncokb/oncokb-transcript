import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { byteSize, Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IFdaSubmissionTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmissionType = (props: IFdaSubmissionTypeProps) => {
  const fdaSubmissionTypeList = props.fdaSubmissionTypeList;
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
      <h2 id="fda-submission-type-heading" data-cy="FdaSubmissionTypeHeading">
        FDA Submission Types
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Fda Submission Type
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {fdaSubmissionTypeList && fdaSubmissionTypeList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Key</th>
                <th>Name</th>
                <th>Short Name</th>
                <th>Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fdaSubmissionTypeList.map((fdaSubmissionType, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${fdaSubmissionType.id}`} color="link" size="sm">
                      {fdaSubmissionType.id}
                    </Button>
                  </td>
                  <td>{fdaSubmissionType.key}</td>
                  <td>{fdaSubmissionType.name}</td>
                  <td>{fdaSubmissionType.shortName}</td>
                  <td>{fdaSubmissionType.description}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${fdaSubmissionType.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${fdaSubmissionType.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${fdaSubmissionType.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Fda Submission Types found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionTypeStore }: IRootStore) => ({
  fdaSubmissionTypeList: fdaSubmissionTypeStore.entities,
  loading: fdaSubmissionTypeStore.loading,
  getEntities: fdaSubmissionTypeStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionType);
