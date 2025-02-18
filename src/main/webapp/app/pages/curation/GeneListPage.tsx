import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Col, Row } from 'reactstrap';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { geneNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import { Link, RouteComponentProps, generatePath, useHistory } from 'react-router-dom';
import { APP_DATETIME_FORMAT, PAGE_ROUTE } from 'app/config/constants/constants';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword } from 'app/shared/util/utils';
import { TextFormat } from 'react-jhipster';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import Tabs, { Tab } from 'app/components/tabs/tabs';
import GeneListPageToolsTab from 'app/components/tabs/GeneListPageToolsTab';
import CurationDataValidationTab from 'app/components/tabs/CurationDataValidationTab';
import { FB_COLLECTION } from 'app/config/constants/firebase';
import ReviewHistoryTab from 'app/components/tabs/ReviewHistoryTab';
import SomaticGermlineToggleButton from './button/SomaticGermlineToggleButton';

const getCurationPageLink = (hugoSymbol: string, isGermline: boolean) => {
  return generatePath(isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE : PAGE_ROUTE.CURATION_GENE_SOMATIC, { hugoSymbol });
};
import CurationDataImportTab from 'app/components/tabs/curation-data-import-tab/CurationDataImportTab';
import { DATA_IMPORT_TAB_ID, GENE_LIST_TABLE_ID } from 'app/config/constants/html-id';
import moment from 'moment';

type GeneMetaInfo = {
  hugoSymbol: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  needsReview: boolean;
};

export interface IGeneListPage extends StoreProps, RouteComponentProps {}

const GeneListPage = (props: IGeneListPage) => {
  const history = useHistory();
  const isGermline = props.isGermline;

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
            lastModifiedAt: props.metaData?.[key].lastModifiedAt ?? '',
            lastModifiedBy: props.metaData?.[key].lastModifiedBy ?? '',
            needsReview: geneNeedsReview(props.metaData?.[key]),
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
      getColumnFilterValue(data: GeneMetaInfo) {
        return data.lastModifiedAt ? moment(parseInt(data.lastModifiedAt, 10)).format(APP_DATETIME_FORMAT) : '';
      },
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
      getColumnFilterValue(data: GeneMetaInfo) {
        return data.needsReview ? 'Yes' : 'No';
      },
      Cell(cell: { value: string }): any {
        return cell.value ? 'Yes' : 'No';
      },
    },
  ];

  const sidebarTabs = useMemo(() => {
    const tabs = [
      {
        title: 'Tools',
        content: <GeneListPageToolsTab metaData={props.metaData} />,
      },
    ] as Tab[];
    if (!isGermline) {
      tabs.push({
        title: 'Data Validation',
        content: <CurationDataValidationTab />,
      });
    }
    tabs.push({
      id: DATA_IMPORT_TAB_ID,
      title: 'Data Import',
      content: <CurationDataImportTab />,
    });
    tabs.push({
      title: 'History',
      content: <ReviewHistoryTab />,
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
              <Row id={GENE_LIST_TABLE_ID}>
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
              <OncoKBSidebar>
                <Tabs className="pe-4 ps-2 mt-1" tabs={sidebarTabs} />
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

const mapStoreToProps = ({ firebaseMetaStore, firebaseAppStore, firebaseGeneService, routerStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  firebaseReady: firebaseAppStore.firebaseReady,
  firebaseInitError: firebaseAppStore.firebaseInitError,
  firebaseLoginError: firebaseAppStore.firebaseLoginError,
  addMetaListener: firebaseMetaStore.addListener,
  metaData: firebaseMetaStore.data,
  createGene: firebaseGeneService.createGene,
  isGermline: routerStore.isGermline,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneListPage);
