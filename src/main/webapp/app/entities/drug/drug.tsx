import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IDrug } from 'app/shared/model/drug.model';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { TableHeader } from 'app/shared/table/TableHeader';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityTable from 'app/shared/table/EntityTable';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Drug = (props: IDrugProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(
      getSortState(props.location, ITEMS_PER_PAGE, DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.DRUG]),
      props.location.search
    )
  );

  const drugList = props.drugList;
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

  const sort = (fieldName: keyof IDrug) => () => {
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

  const { match } = props;

  const columns: Column<IDrug>[] = [
    { accessor: 'name', Header: <TableHeader header="Name" onSort={sort('name')} paginationState={paginationState} sortField="name" /> },
    {
      accessor: 'code',
      Header: <TableHeader header="Code" onSort={sort('code')} paginationState={paginationState} sortField="code" />,
    },
    {
      accessor: 'semanticType',
      Header: (
        <TableHeader header="Semantic Type" onSort={sort('semanticType')} paginationState={paginationState} sortField="semanticType" />
      ),
    },
  ];

  return (
    <div>
      <h2 id="drug-heading" data-cy="DrugHeading">
        Drugs
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>
        {drugList && <EntityTable columns={columns} data={drugList} loading={loading} url={match.url} entityType={ENTITY_TYPE.DRUG} />}
      </div>
      {totalItems && totalItems > 0 ? (
        <div className={drugList && drugList.length > 0 ? '' : 'd-none'}>
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

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugList: drugStore.entities,
  loading: drugStore.loading,
  totalItems: drugStore.totalItems,
  searchEntities: drugStore.searchEntities,
  getEntities: drugStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Drug);
