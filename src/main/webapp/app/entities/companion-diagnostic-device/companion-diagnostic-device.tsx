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
import OncoKBTable, { FilterableColumn } from 'app/shared/table/OncoKBTable';
import { FilterTypes } from 'app/shared/table/filters/types';
export interface ICompanionDiagnosticDeviceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const getFdaSubmissionNumber = (primaryNumber: string | undefined, supplementNumber: string | undefined) => {
  return supplementNumber ? `${primaryNumber}/${supplementNumber}` : primaryNumber ?? '';
};

export const getFdaSubmissionLinks = (fdaSubmissions: IFdaSubmission[], linkComponent = true) => {
  const submissions = fdaSubmissions
    ?.sort((a, b) =>
      getFdaSubmissionNumber(a.number, a.supplementNumber).localeCompare(getFdaSubmissionNumber(b.number, b.supplementNumber)),
    )
    .map(submission => {
      const submissionNumber = getFdaSubmissionNumber(submission.number, submission.supplementNumber);
      if (linkComponent) {
        return (
          <Link to={`${PAGE_ROUTE.FDA_SUBMISSION}/${submission.id}`} key={submissionNumber}>
            {submissionNumber}
          </Link>
        );
      }
      return submissionNumber;
    });

  if (linkComponent) {
    return <WithSeparator separator={', '}>{submissions}</WithSeparator>;
  }
  return submissions.join(', ');
};

export const CompanionDiagnosticDevice = (props: ICompanionDiagnosticDeviceProps) => {
  const companionDiagnosticDeviceList = props.companionDiagnosticDeviceList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const getUniqDrugs = (fdaSubmissions: IFdaSubmission[]) => {
    const drugs = fdaSubmissions.flatMap(fdaSubmission => {
      return fdaSubmission.associations?.reduce((acc: (string | undefined)[], val) => {
        acc.push(...(val.drugs || []).map(drug => drug.name));
        return acc;
      }, []);
    });
    return _.uniq(drugs);
  };

  const columns: FilterableColumn<ICompanionDiagnosticDevice>[] = [
    {
      accessor: 'name',
      Header: 'Device Name',
      onSearchFilter: (data: ICompanionDiagnosticDevice, keyword) => filterByKeyword(data.name, keyword),
      minWidth: 200,
    },
    {
      accessor: 'manufacturer',
      Header: 'Manufacturer',
      onSearchFilter: (data: ICompanionDiagnosticDevice, keyword) => filterByKeyword(data.manufacturer, keyword),
      minWidth: 150,
    },
    {
      id: 'drugs',
      Header: 'Associated Drugs',
      onSearchFilter(data: ICompanionDiagnosticDevice, keyword) {
        const drugs = getUniqDrugs(data.fdaSubmissions ?? [])
          .sort()
          .join(', ');
        return filterByKeyword(drugs, keyword);
      },
      Cell(cell: { original: ICompanionDiagnosticDevice }) {
        return (
          <>
            {getUniqDrugs(cell.original.fdaSubmissions ?? [])
              .sort()
              .join(', ')}
          </>
        );
      },
      disableHeaderFiltering: true,
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      sortable: false,
      onSearchFilter: (data: ICompanionDiagnosticDevice, keyword) =>
        data.fdaSubmissions
          ? filterByKeyword(data.fdaSubmissions.map(s => getFdaSubmissionNumber(s.number, s.supplementNumber)).join(', '), keyword)
          : false,
      Cell(cell: { original: ICompanionDiagnosticDevice }) {
        return <>{getFdaSubmissionLinks(cell.original.fdaSubmissions ?? [])}</>;
      },
      disableHeaderFiltering: true,
      minWidth: 250,
    },
    { accessor: 'platformType', Header: 'Platform Type' },
    {
      accessor: 'lastUpdated',
      Header: 'Last Updated',
      filterType: FilterTypes.DATE,
      getColumnFilterValue(data: ICompanionDiagnosticDevice) {
        return data.lastUpdated ? new Date(data.lastUpdated) : undefined;
      },
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
          className="ms-2"
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
