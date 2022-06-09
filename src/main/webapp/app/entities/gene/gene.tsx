import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { IGene } from 'app/shared/model/gene.model';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { TableHeader } from 'app/shared/table/TableHeader';
import { Column } from 'react-table';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityTable from 'app/shared/table/EntityTable';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Gene = (props: IGeneProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(
      getSortState(props.location, ITEMS_PER_PAGE, DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE]),
      props.location.search
    )
  );

  const geneList = props.geneList;
  const loading = props.loading;
  const totalItems = props.totalItems;

  const getAllEntities = () => {
    if (search) {
      debouncedSearchWithPagination(
        search,
        paginationState.activePage - 1,
        paginationState.itemsPerPage,
        `${paginationState.sort},${paginationState.order}`,
        props.searchEntities
      );
    } else {
      props.getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      });
    }
  };

  const handleSearch = event => setSearch(event.target.value);

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort, search]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = (fieldName: keyof IGene) => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: fieldName,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const columns: Column<IGene>[] = [
    {
      accessor: 'entrezGeneId',
      Header: (
        <TableHeader header="Entrez Gene Id" onSort={sort('entrezGeneId')} paginationState={paginationState} sortField="entrezGeneId" />
      ),
    },
    {
      accessor: 'hugoSymbol',
      Header: <TableHeader header="Hugo Symbol" onSort={sort('hugoSymbol')} paginationState={paginationState} sortField="hugoSymbol" />,
    },
  ];

  const { match } = props;

  return (
    <div>
      <h2 id="gene-heading" data-cy="GeneHeading">
        Genes
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.GENE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>
        {geneList && <EntityTable columns={columns} data={geneList} loading={loading} url={match.url} entityType={ENTITY_TYPE.GENE} />}
      </div>
      {totalItems && totalItems > 0 ? (
        <div className={geneList && geneList.length > 0 ? '' : 'd-none'}>
          <Row className="justify-content-center">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </Row>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  geneList: geneStore.entities,
  loading: geneStore.loading,
  totalItems: geneStore.totalItems,
  searchEntities: geneStore.searchEntities,
  getEntities: geneStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Gene);
