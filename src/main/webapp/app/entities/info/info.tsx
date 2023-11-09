import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IInfo } from 'app/shared/model/info.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
export interface IInfoProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Info = (props: IInfoProps) => {
  const infoList = props.infoList;
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
      <h2 id="info-heading" data-cy="InfoHeading">
        Infos
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Info
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {infoList && infoList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Value</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {infoList.map((info, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${info.id}`} color="link" size="sm">
                      {info.id}
                    </Button>
                  </td>
                  <td>{info.type}</td>
                  <td>{info.value}</td>
                  <td>{info.created ? <TextFormat type="date" value={info.created} format={APP_DATE_FORMAT} /> : null}</td>
                  <td>{info.lastUpdated ? <TextFormat type="date" value={info.lastUpdated} format={APP_DATE_FORMAT} /> : null}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${info.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${info.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${info.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Infos found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ infoStore }: IRootStore) => ({
  infoList: infoStore.entities,
  loading: infoStore.loading,
  getEntities: infoStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Info);
