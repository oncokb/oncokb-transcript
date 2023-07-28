import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Input, InputGroup, FormGroup, Form, Col, Row } from 'reactstrap';
import { ENTITY_ACTION, PAGE_ROUTE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import WithSeparator from 'react-with-separator';
import { debouncedSearch } from 'app/shared/util/crud-store';
import EntityTable from 'app/shared/table/EntityTable';
import { ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
export interface ICompanionDiagnosticDeviceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const getFdaSubmissionNumber = (primaryNumber: string, supplementNumber: string) => {
  return supplementNumber ? `${primaryNumber}/${supplementNumber}` : primaryNumber;
};

export const getFdaSubmissionLinks = (fdaSubmissions: IFdaSubmission[]) => {
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

export const CompanionDiagnosticDevice = (props: ICompanionDiagnosticDeviceProps) => {
  const { match } = props;

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

  const columns: Column<ICompanionDiagnosticDevice>[] = [
    { accessor: 'name', Header: 'Device Name', width: 250 },
    { accessor: 'manufacturer', Header: 'Manufacturer', width: 250 },
    { accessor: 'indicationDetails', Header: 'Indication Details' },
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
      width: 250,
    },
  ];

  return (
    <div>
      <h2 id="companion-diagnostic-device-heading" data-cy="CompanionDiagnosticDeviceHeading">
        Companion Diagnostic Devices
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE}
          entityAction={ENTITY_ACTION.CREATE}
        />
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
          <EntityTable
            columns={columns}
            data={companionDiagnosticDeviceList}
            loading={loading}
            url={match.url}
            entityType={ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE}
          />
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
