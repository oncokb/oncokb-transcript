import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Col, Row } from 'reactstrap';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { geneNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import { Link, RouteComponentProps, generatePath } from 'react-router-dom';
import { APP_DATETIME_FORMAT, GERMLINE_PATH, PAGE_ROUTE } from 'app/config/constants/constants';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword } from 'app/shared/util/utils';
import { TextFormat } from 'react-jhipster';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import Tabs from 'app/components/tabs/tabs';
import GeneListPageToolsTab from 'app/components/tabs/GeneListPageToolsTab';
import CurationDataValidationTab from 'app/components/tabs/CurationDataValidationTab';
import { FB_COLLECTION } from 'app/config/constants/firebase';
import ReviewHistoryTab from 'app/components/tabs/ReviewHistoryTab';
import SomaticGermlineToggleButton from './button/SomaticGermlineToggleButton';
import { OncoKBGrid } from 'app/shared/table/OncoKBGrid';
import { ColDef, ColGroupDef, ColumnState, ICellRendererParams } from 'ag-grid-community';

const getCurationPageLink = (hugoSymbol: string, isGermline: boolean) => {
  return generatePath(isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE : PAGE_ROUTE.CURATION_GENE_SOMATIC, { hugoSymbol });
};

type GeneMetaInfo = {
  hugoSymbol: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  needsReview: boolean;
};

export interface IGeneListPage extends StoreProps, RouteComponentProps {}

const GeneListPage = (props: IGeneListPage) => {
  const pathname = props.location.pathname;
  const isGermline = pathname.includes(GERMLINE_PATH);

  useEffect(() => {
    if (props.firebaseReady) {
      const unsubscribe = props.addMetaListener(isGermline ? FB_COLLECTION.GERMLINE_META : FB_COLLECTION.META);
      return () => unsubscribe?.();
    }
  }, [props.firebaseReady]);

  const geneMeta = useMemo(() => {
    const ignoredKeys = ['collaborators', 'undefined'];
    if (props.metaData) {
      const geneMetaInfoList: GeneMetaInfo[] = [];
      Object.keys(props.metaData)
        .filter(key => !ignoredKeys.includes(key))
        .map(key => {
          const geneMetaInfo: GeneMetaInfo = {
            hugoSymbol: key,
            lastModifiedAt: props.metaData[key].lastModifiedAt,
            lastModifiedBy: props.metaData[key].lastModifiedBy,
            needsReview: geneNeedsReview(props.metaData[key]),
          };
          geneMetaInfoList.push(geneMetaInfo);
        });
      return geneMetaInfoList;
    }
  }, [props.metaData]);

  const columns: SearchColumn<GeneMetaInfo>[] = [
    {
      accessor: 'hugoSymbol',
      Header: 'Hugo Symbol',
      Cell(cell: { value: string }): any {
        return <Link to={getCurationPageLink(cell.value, isGermline)}>{cell.value}</Link>;
      },
      onFilter: (data: GeneMetaInfo, keyword) => (data.hugoSymbol ? filterByKeyword(data.hugoSymbol, keyword) : false),
    },
    {
      accessor: 'lastModifiedAt',
      Header: 'Last modified at',
      Cell(cell: { value: string }): any {
        return cell.value ? <TextFormat value={new Date(parseInt(cell.value, 10))} type="date" format={APP_DATETIME_FORMAT} /> : '';
      },
    },
    {
      accessor: 'lastModifiedBy',
      Header: 'Last modified by',
    },
    {
      accessor: 'needsReview',
      Header: 'Needs to be Reviewed',
      Cell(cell: { value: string }): any {
        return cell.value ? 'Yes' : 'No';
      },
    },
  ];
  const columDefs: (ColDef<GeneMetaInfo> | ColGroupDef<GeneMetaInfo>)[] = [
    {
      field: 'hugoSymbol',
      headerName: 'Hugo Symbol',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => <Link to={getCurationPageLink(params.value, isGermline)}>{params.value}</Link>,
    },
    {
      field: 'lastModifiedAt',
      headerName: 'Last modified at',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) =>
        params.value ? <TextFormat value={new Date(parseInt(params.value, 10))} type="date" format={APP_DATETIME_FORMAT} /> : '',
      filter: 'agDateColumnFilter',
    },
    {
      field: 'lastModifiedBy',
      headerName: 'Last modified by',
      flex: 1,
      filter: 'agTextColumnFilter',
      filterParams: {
        values: geneMeta?.map(meta => meta.lastModifiedBy) || [], // Provide the list of values
      },
    },
    {
      field: 'needsReview',
      headerName: 'Needs to be Reviewed',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => (params.value ? 'Yes' : 'No'),
    },
  ];

  const sidebarTabs = useMemo(() => {
    const tabs = [
      {
        title: 'Tools',
        content: <GeneListPageToolsTab metaData={props.metaData} />,
      },
    ];
    if (!isGermline) {
      tabs.push({
        title: 'Data Validation',
        content: <CurationDataValidationTab />,
      });
    }
    tabs.push({
      title: 'History',
      content: <ReviewHistoryTab isGermline={isGermline} />,
    });
    return tabs;
  }, [props.metaData]);

  return (
    <>
      {props.firebaseReady && (
        <>
          {geneMeta ? (
            <>
              <Row>
                <Col>
                  <SomaticGermlineToggleButton />
                </Col>
              </Row>
              <Row id={'gene-list'}>
                <Col>
                  <OncoKBTable
                    data={geneMeta}
                    columns={columns}
                    showPagination
                    defaultSorted={[
                      {
                        id: 'needsReview',
                        desc: true,
                      },
                      {
                        id: 'lastModifiedAt',
                        desc: true,
                      },
                    ]}
                  />
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <OncoKBGrid
                    rowData={geneMeta}
                    columnDefs={columDefs}
                    onGridReady={params => {
                      const defaultSortModel: ColumnState[] = [
                        { colId: 'needsReview', sort: 'desc', sortIndex: 0 },
                        { colId: 'lastModifiedAt', sort: 'asc', sortIndex: 1 },
                      ];
                      params.api.applyColumnState({ state: defaultSortModel });
                    }}
                  />
                </Col>
              </Row>
              <OncoKBSidebar defaultOpen>
                <Tabs tabs={sidebarTabs} />
              </OncoKBSidebar>
            </>
          ) : (
            <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
          )}
        </>
      )}
      {props.firebaseInitError && <div>Error loading Firebase.</div>}
      {props.firebaseLoginError && <div>Error login to Firebase.</div>}
    </>
  );
};

const mapStoreToProps = ({ firebaseMetaStore, firebaseAppStore }: IRootStore) => ({
  firebaseReady: firebaseAppStore.firebaseReady,
  firebaseInitError: firebaseAppStore.firebaseInitError,
  firebaseLoginError: firebaseAppStore.firebaseLoginError,
  addMetaListener: firebaseMetaStore.addListener,
  metaData: firebaseMetaStore.data,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneListPage);
