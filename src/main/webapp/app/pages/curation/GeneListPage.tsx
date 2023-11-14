import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Row, Col } from 'reactstrap';
import { If, Then, Else } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { geneNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import _ from 'lodash';
import { Column } from 'react-table';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants/constants';
import OncoKBTable from 'app/shared/table/OncoKBTable';

type GeneMetaInfo = {
  hugoSymbol: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  needsReview: boolean;
};

const GeneListPage = (props: StoreProps) => {
  useEffect(() => {
    const unsubscribe = props.addMetaListener();
    return () => unsubscribe && unsubscribe();
  }, []);

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

  const columns: Column<GeneMetaInfo>[] = [
    {
      accessor: 'hugoSymbol',
      Header: 'Hugo Symbol',
      Cell(cell: { value: string }): any {
        return <Link to={`${PAGE_ROUTE.CURATION}/${cell.value}`}>{cell.value}</Link>;
      },
    },
    {
      accessor: 'lastModifiedAt',
      Header: 'Last modified at',
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
    <If condition={!!props.metaData && !!geneMeta}>
      <Then>
        <Row>
          <Col>
            <OncoKBTable data={geneMeta} columns={columns} showPagination />
          </Col>
        </Row>
      </Then>
      <Else>
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
      </Else>
    </If>
  );
};

const mapStoreToProps = ({ firebaseMetaStore }: IRootStore) => ({
  addMetaListener: firebaseMetaStore.addMetaListListener,
  metaData: firebaseMetaStore.metaList,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneListPage);
