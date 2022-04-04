import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface ICompanionDiagnosticDeviceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CompanionDiagnosticDevice = (props: ICompanionDiagnosticDeviceProps) => {
  const companionDiagnosticDeviceList = props.companionDiagnosticDeviceList;
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
      <h2 id="companion-diagnostic-device-heading" data-cy="CompanionDiagnosticDeviceHeading">
        Companion Diagnostic Devices
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Companion Diagnostic Device
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {companionDiagnosticDeviceList && companionDiagnosticDeviceList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Specimen Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {companionDiagnosticDeviceList.map((companionDiagnosticDevice, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${companionDiagnosticDevice.id}`} color="link" size="sm">
                      {companionDiagnosticDevice.id}
                    </Button>
                  </td>
                  <td>{companionDiagnosticDevice.name}</td>
                  <td>{companionDiagnosticDevice.manufacturer}</td>
                  <td>
                    {companionDiagnosticDevice.specimenTypes
                      ? companionDiagnosticDevice.specimenTypes.map((val, j) => (
                          <span key={j}>
                            <Link to={`specimen-type/${val.id}`}>{val.id}</Link>
                            {j === companionDiagnosticDevice.specimenTypes.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button
                        tag={Link}
                        to={`${match.url}/${companionDiagnosticDevice.id}`}
                        color="info"
                        size="sm"
                        data-cy="entityDetailsButton"
                      >
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${companionDiagnosticDevice.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${companionDiagnosticDevice.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Companion Diagnostic Devices found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ companionDiagnosticDeviceStore }: IRootStore) => ({
  companionDiagnosticDeviceList: companionDiagnosticDeviceStore.entities,
  loading: companionDiagnosticDeviceStore.loading,
  getEntities: companionDiagnosticDeviceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDevice);
