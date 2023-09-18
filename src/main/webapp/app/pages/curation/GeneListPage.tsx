import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Row, Col, Input } from 'reactstrap';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { If, Then, Else } from 'react-if';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { geneNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import { TableHeader } from 'app/shared/table/TableHeader';
import { IPaginationBaseState, JhiItemCount, JhiPagination } from 'react-jhipster';
import { ASC, DESC, ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';
import _ from 'lodash';
import { Column } from 'react-table';
import { filterByKeyword } from 'app/shared/util/utils';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';

type GeneMetaInfo = {
  hugoSymbol: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  needsReview: boolean;
};

const GeneListPage = (props: StoreProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState({
    itemsPerPage: ITEMS_PER_PAGE,
    sort: 'needsReview',
    order: 'desc',
    activePage: 1,
  } as IPaginationBaseState);

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const sort = (fieldName: keyof GeneMetaInfo) => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: fieldName,
    });
  };

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

  const filteredGeneMeta = useMemo(() => {
    const searchableColumns: (keyof GeneMetaInfo)[] = ['hugoSymbol'];
    if (geneMeta) {
      return geneMeta.filter(item => {
        return searchableColumns.map(column => filterByKeyword(item[column as string], search)).includes(true);
      });
    }
  }, [search, geneMeta]);

  const paginatedGeneMeta = useMemo(() => {
    const offsetIndex = (paginationState.activePage - 1) * paginationState.itemsPerPage;
    if (filteredGeneMeta) {
      const sortedGeneMeta = _.orderBy(filteredGeneMeta, [paginationState.sort], [paginationState.order === ASC ? ASC : DESC]);
      return sortedGeneMeta.slice(offsetIndex, offsetIndex + paginationState.itemsPerPage);
    }
  }, [filteredGeneMeta, paginationState]);

  const columns: Column<GeneMetaInfo>[] = [
    {
      accessor: 'hugoSymbol',
      Header: <TableHeader header="Gene" onSort={sort('hugoSymbol')} paginationState={paginationState} sortField="hugoSymbol" />,
      Cell: ({ cell: { value } }) => (value ? <Link to={`${PAGE_ROUTE.CURATION}/${value}`}>{value}</Link> : ''),
    },
    {
      accessor: 'lastModifiedAt',
      Header: (
        <TableHeader
          header="Last modified at"
          onSort={sort('lastModifiedAt')}
          paginationState={paginationState}
          sortField="lastModifiedAt"
        />
      ),
    },
    {
      accessor: 'lastModifiedBy',
      Header: (
        <TableHeader
          header="Last modified by"
          onSort={sort('lastModifiedBy')}
          paginationState={paginationState}
          sortField="lastModifiedBy"
        />
      ),
    },
    {
      accessor: 'needsReview',
      Header: (
        <TableHeader header="Needs to be reviewed" onSort={sort('needsReview')} paginationState={paginationState} sortField="needsReview" />
      ),
      Cell: ({ cell: { value } }) => (value ? 'Yes' : 'No'),
    },
  ];

  return (
    <If condition={!!props.metaData && !!geneMeta}>
      <Then>
        <Row className="justify-content-end mb-3">
          <Col sm="4">
            <Input type="text" name="search" defaultValue={search} onChange={event => setSearch(event.target.value)} placeholder="Search" />
          </Col>
        </Row>
        <Row>
          <Col>
            <OncoKBTable data={paginatedGeneMeta} columns={columns} />
            {geneMeta && geneMeta.length > 0 ? (
              <div className={paginatedGeneMeta && paginatedGeneMeta.length > 0 ? '' : 'd-none'}>
                <Row className="justify-content-center">
                  <JhiItemCount
                    page={paginationState.activePage}
                    total={filteredGeneMeta.length}
                    itemsPerPage={paginationState.itemsPerPage}
                  />
                </Row>
                <Row className="justify-content-center">
                  <JhiPagination
                    activePage={paginationState.activePage}
                    onSelect={handlePagination}
                    maxButtons={5}
                    itemsPerPage={paginationState.itemsPerPage}
                    totalItems={filteredGeneMeta.length}
                  />
                </Row>
              </div>
            ) : undefined}
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
