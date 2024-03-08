import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { APP_DATE_FORMAT, ENTITY_ACTION, PAGE_ROUTE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import WithSeparator from 'react-with-separator';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { TextFormat } from 'react-jhipster';
import _ from 'lodash';
import { filterByKeyword, getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
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
  const companionDiagnosticDeviceList = props.companionDiagnosticDeviceList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const getUniqDrugs = (fdaSubmissions: IFdaSubmission[]) => {
    const drugs = [];
    fdaSubmissions.forEach(fdaSubmission => {
      fdaSubmission.associations?.reduce((acc, val) => {
        acc.push(...(val.drugs || []).map(drug => drug.name));
        return acc;
      }, drugs);
    });
    return _.uniq(drugs);
  };

  const columns: SearchColumn<ICompanionDiagnosticDevice>[] = [
    {
      accessor: 'name',
      Header: 'Device Name',
      onFilter: (data: ICompanionDiagnosticDevice, keyword) => (data.name ? filterByKeyword(data.name, keyword) : false),
      minWidth: 200,
    },
    {
      accessor: 'manufacturer',
      Header: 'Manufacturer',
      onFilter: (data: ICompanionDiagnosticDevice, keyword) => (data.manufacturer ? filterByKeyword(data.manufacturer, keyword) : false),
      minWidth: 150,
    },
    {
      id: 'drugs',
      Header: 'Associated Drugs',
      Cell(cell: { original: ICompanionDiagnosticDevice }) {
        return <>{getUniqDrugs(cell.original.fdaSubmissions).sort().join(', ')}</>;
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      sortable: false,
      onFilter: (data: ICompanionDiagnosticDevice, keyword) =>
        data.fdaSubmissions
          ? filterByKeyword(data.fdaSubmissions.map(s => getFdaSubmissionNumber(s.number, s.supplementNumber)).join(', '), keyword)
          : false,
      Cell(cell: { original: ICompanionDiagnosticDevice }) {
        return <>{getFdaSubmissionLinks(cell.original.fdaSubmissions)}</>;
      },
      minWidth: 250,
    },
    { accessor: 'platformType', Header: 'Platform Type' },
    {
      accessor: 'lastUpdated',
      Header: 'Last Updated',

      Cell(cell: { original: ICompanionDiagnosticDevice }) {
        return cell.original?.lastUpdated ? <TextFormat value={cell.original.lastUpdated} type="date" format={APP_DATE_FORMAT} /> : null;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE),
  ];

  return (
    <div>
      <h2 id="companion-diagnostic-device-heading" data-cy="CompanionDiagnosticDeviceHeading">
        Companion Diagnostic Devices
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE}
          entityAction={ENTITY_ACTION.ADD}
        />
      </h2>
      <div>
        {companionDiagnosticDeviceList && (
          <OncoKBTable columns={columns} data={companionDiagnosticDeviceList.concat()} loading={loading} showPagination />
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
