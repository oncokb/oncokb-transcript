import React, { useEffect, useState } from 'react';
import ReactTable, { SortingRule, TableProps } from 'react-table';
import { Col, Input, Row } from 'reactstrap';
import { ASC, DESC, ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';
import { debouncedSearchWithPagination } from '../util/pagination-crud-store';
import { IQueryParams, ISearchParams } from '../util/jhipster-types';
import { overridePaginationStateWithQueryParams } from '../util/entity-utils';
import { useHistory } from 'react-router-dom';
import * as H from 'history';

/* eslint-disable @typescript-eslint/ban-types */
export interface IOncoKBAsyncTableProps<T> extends Partial<TableProps<T>> {
  initialPaginationState: PaginationState<T>;
  searchEntities: ({ query, page, size, sort }: ISearchParams) => void;
  getEntities: ({ page, size, sort }: IQueryParams) => void;
  totalItems: number;
  loading?: boolean;
  fixedHeight?: boolean;
}

export type PaginationState<T> = {
  order: typeof ASC | typeof DESC;
  sort: keyof T;
  activePage: number;
};

function paginationToSortingRule<T>(paginationState: PaginationState<T>): SortingRule {
  return {
    id: paginationState.sort as string,
    desc: paginationState.order === 'desc',
  };
}

export const OncoKBAsyncTable = <T extends object>(props: IOncoKBAsyncTableProps<T>) => {
  const history: H.History = useHistory();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageSize, setPageSize] = useState(props.defaultPageSize || ITEMS_PER_PAGE);
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(
      props.initialPaginationState || { sort: 'id', activePage: 0, order: 'asc', itemsPerPage: 1 },
      history.location.search,
    ),
  );

  useEffect(() => {
    if (searchKeyword) {
      debouncedSearchWithPagination(
        {
          query: searchKeyword,
          page: paginationState.activePage - 1,
          size: props.pageSize,
          sort: [`${paginationState.sort as string},${paginationState.order}`],
        },
        props.searchEntities,
      );
    } else {
      props.getEntities({
        page: paginationState.activePage - 1,
        size: pageSize,
        sort: [`${paginationState.sort as string},${paginationState.order}`],
      });
    }
  }, [paginationState.activePage, paginationState.order, paginationState.sort, pageSize, searchKeyword]);

  const handleFetchData = (state: any) => {
    setPageSize(state.pageSize);
    setPaginationState(oldState => ({ ...oldState, activePage: state.page + 1 }));
  };

  const sortEntities = () => {
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort as string},${paginationState.order}`;
    if (history.location.search !== endURL) {
      history.push(`${history.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort, searchKeyword]);

  /* eslint-disable no-console */
  console.log([paginationToSortingRule(paginationState)]);

  return (
    <div>
      <Row className="justify-content-end mb-3">
        <Col sm="2">
          <Input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            onChange={event => setSearchKeyword(event.target.value.toLowerCase())}
            placeholder="Search ..."
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <ReactTable
            {...props}
            manual
            pages={Math.ceil(props.totalItems / pageSize)}
            pageSize={pageSize}
            sorted={[paginationToSortingRule(paginationState)]}
            onFetchData={handleFetchData}
            className={`-striped -highlight oncokbReactTable ${props.fixedHeight ? 'fixedHeight' : ''} ${props.className}`}
            onSortedChange={newSorted => {
              setPaginationState(oldState => ({
                ...oldState,
                sort: newSorted[0].id as keyof T,
                order: newSorted[0].desc ? 'desc' : 'asc',
              }));
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default OncoKBAsyncTable;
