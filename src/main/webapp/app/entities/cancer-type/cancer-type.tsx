import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ICancerType } from 'app/shared/model/cancer-type.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface ICancerTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CancerType = (props: ICancerTypeProps) => {
  const cancerTypeList = props.cancerTypeList;
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
      <h2 id="cancer-type-heading" data-cy="CancerTypeHeading">
        Cancer Types
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Cancer Type
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {cancerTypeList && cancerTypeList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Color</th>
                <th>Level</th>
                <th>Main Type</th>
                <th>Subtype</th>
                <th>Tissue</th>
                <th>Tumor Form</th>
                <th>Parent</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cancerTypeList.map((cancerType, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${cancerType.id}`} color="link" size="sm">
                      {cancerType.id}
                    </Button>
                  </td>
                  <td>{cancerType.code}</td>
                  <td>{cancerType.color}</td>
                  <td>{cancerType.level}</td>
                  <td>{cancerType.mainType}</td>
                  <td>{cancerType.subtype}</td>
                  <td>{cancerType.tissue}</td>
                  <td>{cancerType.tumorForm}</td>
                  <td>{cancerType.parent ? <Link to={`cancer-type/${cancerType.parent.id}`}>{cancerType.parent.id}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${cancerType.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${cancerType.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${cancerType.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Cancer Types found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ cancerTypeStore }: IRootStore) => ({
  cancerTypeList: cancerTypeStore.entities,
  loading: cancerTypeStore.loading,
  getEntities: cancerTypeStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CancerType);
