import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IDeviceUsageIndicationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const DeviceUsageIndication = (props: IDeviceUsageIndicationProps) => {
  const deviceUsageIndicationList = props.deviceUsageIndicationList;
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
      <h2 id="device-usage-indication-heading" data-cy="DeviceUsageIndicationHeading">
        Device Usage Indications
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Device Usage Indication
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {deviceUsageIndicationList && deviceUsageIndicationList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fda Submission</th>
                <th>Alteration</th>
                <th>Cancer Type</th>
                <th>Drug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {deviceUsageIndicationList.map((deviceUsageIndication, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${deviceUsageIndication.id}`} color="link" size="sm">
                      {deviceUsageIndication.id}
                    </Button>
                  </td>
                  <td>
                    {deviceUsageIndication.fdaSubmission ? (
                      <Link to={`fda-submission/${deviceUsageIndication.fdaSubmission.id}`}>{deviceUsageIndication.fdaSubmission.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {deviceUsageIndication.cancerType ? (
                      <Link to={`cancer-type/${deviceUsageIndication.cancerType.id}`}>{deviceUsageIndication.cancerType.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button
                        tag={Link}
                        to={`${match.url}/${deviceUsageIndication.id}`}
                        color="info"
                        size="sm"
                        data-cy="entityDetailsButton"
                      >
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${deviceUsageIndication.id}/edit`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${deviceUsageIndication.id}/delete`}
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
          !loading && <div className="alert alert-warning">No Device Usage Indications found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ deviceUsageIndicationStore }: IRootStore) => ({
  deviceUsageIndicationList: deviceUsageIndicationStore.entities,
  loading: deviceUsageIndicationStore.loading,
  getEntities: deviceUsageIndicationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DeviceUsageIndication);
