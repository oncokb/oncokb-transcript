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
      const callbacks = [];
      if (isGermline) {
        callbacks.push(props.addGermlineMetaListener(FB_COLLECTION.GERMLINE_META));
      } else {
        callbacks.push(props.addMetaListener(FB_COLLECTION.META));
      }
      return () => callbacks.forEach(callback => callback?.());
    }
  }, [props.firebaseReady]);

  const geneMeta = useMemo(() => {
    const ignoredKeys = ['collaborators', 'undefined'];
    const meta = isGermline ? props.germlineMetaData : props.metaData;
    if (meta) {
      const geneMetaInfoList: GeneMetaInfo[] = [];
      Object.keys(meta)
        .filter(key => !ignoredKeys.includes(key))
        .map(key => {
          const geneMetaInfo: GeneMetaInfo = {
            hugoSymbol: key,
            lastModifiedAt: meta[key].lastModifiedAt,
            lastModifiedBy: meta[key].lastModifiedBy,
            needsReview: geneNeedsReview(meta[key]),
          };
          geneMetaInfoList.push(geneMetaInfo);
        });
      return geneMetaInfoList;
    }
  }, [props.metaData, props.germlineMetaData]);

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

  const sidebarTabs = [
    {
      title: 'Tools',
      content: <GeneListPageToolsTab metaData={isGermline ? props.germlineMetaData : props.metaData} />,
    },
  ];

  if (!isGermline) {
    sidebarTabs.push({
      title: 'Data Validation',
      content: <CurationDataValidationTab />,
    });
    sidebarTabs.push({
      title: 'History',
      content: <ReviewHistoryTab />,
    });
  }

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

const mapStoreToProps = ({ firebaseMetaStore, firebaseAppStore, firebaseGermlineMetaStore }: IRootStore) => ({
  firebaseReady: firebaseAppStore.firebaseReady,
  firebaseInitError: firebaseAppStore.firebaseInitError,
  firebaseLoginError: firebaseAppStore.firebaseLoginError,
  addMetaListener: firebaseMetaStore.addListener,
  metaData: firebaseMetaStore.data,
  addGermlineMetaListener: firebaseGermlineMetaStore.addListener,
  germlineMetaData: firebaseGermlineMetaStore.data,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneListPage);
