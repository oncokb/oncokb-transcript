import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IGene } from 'app/shared/model/gene.model';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import { TableHeader } from 'app/shared/table/TableHeader';
import { Column } from 'react-table';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
export interface IGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Gene = (props: IGeneProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const geneList = props.geneList;
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
      Header: <TableHeader header="Entrez Gene Id" onSort={sort('entrezGeneId')} sortDirection={paginationState.order} />,
    },
    {
      accessor: 'hugoSymbol',
      Header: <TableHeader header="Hugo Symbol" onSort={sort('hugoSymbol')} sortDirection={paginationState.order} />,
    },
    {
      id: 'actions',
      Header: 'Actions',
      Cell({
        cell: {
          row: { original },
        },
      }): any {
        return (
          <div className="btn-group flex-btn-group-container">
            <Button tag={Link} to={`${match.url}/${original.id}`} color="info" size="sm" data-cy="entityDetailsButton">
              <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
            </Button>
            <Button
              tag={Link}
              to={`${match.url}/${original.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
              color="primary"
              size="sm"
              data-cy="entityEditButton"
            >
              <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
            </Button>
            <Button
              tag={Link}
              to={`${match.url}/${original.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
              color="danger"
              size="sm"
              data-cy="entityDeleteButton"
            >
              <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const { match } = props;

  return (
    <div>
      <h2 id="gene-heading" data-cy="GeneHeading">
        Genes
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
      <div className="table-responsive">{geneList && <OncoKBTable columns={columns} data={geneList}></OncoKBTable>}</div>
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
