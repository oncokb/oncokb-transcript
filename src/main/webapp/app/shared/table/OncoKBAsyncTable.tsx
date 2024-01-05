import React, { useEffect, useState } from 'react';
import ReactTable, { TableProps } from 'react-table';
import { Col, Input, Row } from 'reactstrap';
import { ASC, DESC, ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';
import { debouncedSearchWithPagination } from '../util/pagination-crud-store';

/* eslint-disable @typescript-eslint/ban-types */
export interface IOncoKBAsyncTableProps<T> extends Partial<TableProps<T>> {
  initialPaginationState: PaginationState<T>;
  searchEntities: ({ query, page, size, sort }) => void;
  getEntities: ({ page, size, sort }) => void;
  totalItems: number;
  loading?: boolean;
  fixedHeight?: boolean;
}

export type PaginationState<T> = {
  order: typeof ASC | typeof DESC;
  sort: keyof T;
  activePage: number;
};

export const OncoKBAsyncTable = <T extends object>(props: IOncoKBAsyncTableProps<T>) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageSize, setPageSize] = useState(props.defaultPageSize || ITEMS_PER_PAGE);
  const [paginationState, setPaginationState] = useState(props.initialPaginationState || { sort: 'id', activePage: 0, order: 'asc' });

  useEffect(() => {
    if (searchKeyword) {
      debouncedSearchWithPagination(
        searchKeyword,
        paginationState.activePage - 1,
        props.pageSize,
        `${paginationState.sort as string},${paginationState.order}`,
        props.searchEntities
      );
    } else {
      props.getEntities({
        page: paginationState.activePage - 1,
        size: pageSize,
        sort: `${paginationState.sort as string},${paginationState.order}`,
      });
    }
  }, [paginationState.activePage, paginationState.order, paginationState.sort, pageSize, searchKeyword]);

  const handleFetchData = (state: any) => {
    setPageSize(state.pageSize);
    setPaginationState({ ...paginationState, activePage: state.page + 1 });
  };

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
            onFetchData={handleFetchData}
            className={`-striped -highlight oncokbReactTable ${props.fixedHeight ? 'fixedHeight' : ''} ${props.className}`}
          />
        </Col>
      </Row>
    </div>
  );
};

export default OncoKBAsyncTable;
