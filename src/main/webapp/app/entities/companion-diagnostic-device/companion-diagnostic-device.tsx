import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, PAGE_ROUTE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import WithSeparator from 'react-with-separator';
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

  const getFdaSubmissionNumber = (primaryNumber: string, supplementNumber: string) => {
    return supplementNumber ? `${primaryNumber}/${supplementNumber}` : primaryNumber;
  };

  const getFdaSubmissionLinks = (fdaSubmissions: IFdaSubmission[]) => {
    return (
      <WithSeparator separator=", ">
        {fdaSubmissions
          .sort((a, b) =>
            getFdaSubmissionNumber(a.number, a.supplementNumber).localeCompare(getFdaSubmissionNumber(b.number, b.supplementNumber))
          )
          .map(submission => {
            const submissionNumber = getFdaSubmissionNumber(submission.number, submission.supplementNumber);
            return (
              <Link to={`${PAGE_ROUTE.FDA_SUBMISSION}/${submission.id}`} key={submissionNumber}>
                {submissionNumber}
              </Link>
            );
          })}
      </WithSeparator>
    );
  };

  const { match } = props;

  const columns: Column<ICompanionDiagnosticDevice>[] = [
    { accessor: 'name', Header: 'Device Name' },
    { accessor: 'manufacturer', Header: 'Manufacturer' },
    {
      id: 'specimenTypes',
      Header: 'Specimen Types',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: any } };
      }): any {
        return (
          <>
            {original.specimenTypes
              .map(specimenType => specimenType.type)
              .sort()
              .join(', ')}
          </>
        );
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: any } };
      }): any {
        return <>{getFdaSubmissionLinks(original.fdaSubmissions)}</>;
      },
    },
    {
      id: 'actions',
      Header: 'Actions',
      Cell({
        cell: {
          row: { original },
        },
      }): any {
        return (
          <div className="btn-group flex-btn-group-container">
            <Button tag={Link} to={`${match.url}/${original.id}`} color="info" size="sm" data-cy="entityDetailsButton">
              <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
            </Button>
            <Button tag={Link} to={`${match.url}/${original.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
              <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
            </Button>
            <Button tag={Link} to={`${match.url}/${original.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
              <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

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
          <OncoKBTable columns={columns} data={companionDiagnosticDeviceList} />
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
