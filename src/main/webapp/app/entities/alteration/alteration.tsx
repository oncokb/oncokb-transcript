import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IAlteration } from 'app/shared/model/alteration.model';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { TableHeader } from 'app/shared/table/TableHeader';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityTable from 'app/shared/table/EntityTable';
export interface IAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Alteration = (props: IAlterationProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const alterationList = props.alterationList;
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

  const sort = (fieldName: keyof IAlteration) => () => {
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

  const columns: Column<IAlteration>[] = [
    { accessor: 'name', Header: <TableHeader header="Name" onSort={sort('name')} paginationState={paginationState} sortField="name" /> },
    {
      accessor: 'alteration',
      Header: <TableHeader header="Alteration" onSort={sort('alteration')} paginationState={paginationState} sortField="alteration" />,
    },
    { accessor: 'type', Header: <TableHeader header="Type" onSort={sort('type')} paginationState={paginationState} sortField="type" /> },
    {
      accessor: 'proteinStart',
      Header: 'Protein Start',
      maxWidth: 50,
    },
    {
      accessor: 'proteinEnd',
      Header: 'Protein End',
      maxWidth: 50,
    },
    {
      accessor: 'refResidues',
      Header: 'Ref Residues',
      maxWidth: 50,
    },
    {
      accessor: 'variantResidues',
      Header: 'Variant Residues',
      maxWidth: 50,
    },
  ];

  return (
    <div>
      <h2 id="alteration-heading" data-cy="AlterationHeading">
        Alterations
        <span className="ml-2">
          <Link
            to={`${match.url}/new`}
            className="btn btn-primary btn-sm jh-create-entity"
            id="jh-create-entity"
            data-cy="entityCreateButton"
          >
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create
          </Link>
        </span>
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>{alterationList && <EntityTable columns={columns} data={alterationList} loading={loading} url={match.url} />}</div>
      {totalItems && totalItems > 0 ? (
        <div className={alterationList && alterationList.length > 0 ? '' : 'd-none'}>
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

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  alterationList: alterationStore.entities,
  loading: alterationStore.loading,
  totalItems: alterationStore.totalItems,
  searchEntities: alterationStore.searchEntities,
  getEntities: alterationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Alteration);
