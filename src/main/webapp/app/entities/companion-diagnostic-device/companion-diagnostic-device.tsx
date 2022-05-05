import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Input, InputGroup, FormGroup, Form, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, PAGE_ROUTE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import WithSeparator from 'react-with-separator';
import { debouncedSearch } from 'app/shared/util/crud-store';
import EntityTable from 'app/shared/table/EntityTable';
export interface ICompanionDiagnosticDeviceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CompanionDiagnosticDevice = (props: ICompanionDiagnosticDeviceProps) => {
  const [search, setSearch] = useState('');

  const companionDiagnosticDeviceList = props.companionDiagnosticDeviceList;
  const loading = props.loading;

  useEffect(() => {
    if (search) {
      debouncedSearch(search, props.searchEntities);
    } else {
      props.getEntities({});
    }
  }, [search]);

  const handleSearch = (event: any) => setSearch(event.target.value);

  const getFdaSubmissionNumber = (primaryNumber: string, supplementNumber: string) => {
    return supplementNumber ? `${primaryNumber}/${supplementNumber}` : primaryNumber;
  };

  const getFdaSubmissionLinks = (fdaSubmissions: IFdaSubmission[]) => {
    return (
      fdaSubmissions && (
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
      )
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
        cell: { row: { original: ICompanionDiagnosticDevice } };
      }): any {
        return (
          <>
            {original.specimenTypes &&
              original.specimenTypes
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
  ];

  return (
    <div>
      <h2 id="companion-diagnostic-device-heading" data-cy="CompanionDiagnosticDeviceHeading">
        Companion Diagnostic Devices
        <span className="ml-2">
          <Link
            to={`${match.url}/new`}
            className="btn btn-primary btn-sm jh-create-entity"
            id="jh-create-entity"
            data-cy="entityCreateButton"
          >
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create
          </Link>
        </span>
      </h2>
      <Row className="justify-content-end">
        <Col sm="4">
          <Form>
            <FormGroup>
              <InputGroup>
                <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
              </InputGroup>
            </FormGroup>
          </Form>
        </Col>
      </Row>
      <div>
        {companionDiagnosticDeviceList && (
          <EntityTable columns={columns} data={companionDiagnosticDeviceList} loading={loading} url={match.url} />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ companionDiagnosticDeviceStore }: IRootStore) => ({
  companionDiagnosticDeviceList: companionDiagnosticDeviceStore.entities,
  loading: companionDiagnosticDeviceStore.loading,
  searchEntities: companionDiagnosticDeviceStore.searchEntities,
  getEntities: companionDiagnosticDeviceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDevice);
