import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Col, Row } from 'reactstrap';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { geneNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import { Link } from 'react-router-dom';
import { APP_DATETIME_FORMAT, PAGE_ROUTE } from 'app/config/constants/constants';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword } from 'app/shared/util/utils';
import { TextFormat } from 'react-jhipster';
import OncoKBSidebar from 'app/components/sidebar/OncoKBSidebar';
import Tabs from 'app/components/tabs/tabs';
import GeneListPageToolsTab from 'app/components/tabs/GeneListPageToolsTab';

type GeneMetaInfo = {
  hugoSymbol: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  needsReview: boolean;
};

const GeneListPage = (props: StoreProps) => {
  useEffect(() => {
    if (props.firebaseReady) {
      const unsubscribe = props.addMetaListener();
      return () => unsubscribe && unsubscribe();
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
        return <Link to={`${PAGE_ROUTE.CURATION}/${cell.value}`}>{cell.value}</Link>;
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

  return (
    <>
      {props.firebaseReady && (
        <>
          {!!props.metaData && !!geneMeta ? (
            <Row>
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
                  ]}
                />
              </Col>
            </Row>
          ) : (
            <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
          )}
          <OncoKBSidebar defaultOpen>
            <Tabs
              tabs={[
                {
                  title: 'Tools',
                  content: <GeneListPageToolsTab />,
                },
              ]}
            />
          </OncoKBSidebar>
        </>
      )}
      {props.firebaseInitError && <div>Error loading Firebase.</div>}
      {props.firebaseLoginError && <div>Error login to Firebase.</div>}
    </>
  );
};

const mapStoreToProps = ({ firebaseMetaStore, firebaseStore }: IRootStore) => ({
  firebaseReady: firebaseStore.firebaseReady,
  firebaseInitError: firebaseStore.firebaseInitError,
  firebaseLoginError: firebaseStore.firebaseLoginError,
  addMetaListener: firebaseMetaStore.addMetaListListener,
  metaData: firebaseMetaStore.metaList,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneListPage);
