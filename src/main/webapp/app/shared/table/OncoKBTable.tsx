import React, { useMemo, useState } from 'react';
import ReactTable, { Column, TableProps } from 'react-table';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
export type SearchColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
};

export interface ITableWithSearchBox<T> extends Partial<TableProps<T>> {
  data: T[];
  disableSearch?: boolean;
  fixedHeight?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  minRows?: number;
  columns: SearchColumn<T>[];
  loading?: boolean;
  filters?: React.FunctionComponent;
  className?: string;
}

export const OncoKBTable = <T extends object>({ disableSearch = false, showPagination = false, ...props }: ITableWithSearchBox<T>) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredData = useMemo(() => {
    return props.data.filter((item: T) => {
      const filterableColumns = props.columns.filter(column => !!column.onFilter);
      if (filterableColumns.length > 0) {
        return filterableColumns.map(column => column.onFilter(item, searchKeyword)).includes(true);
      } else {
        return true;
      }
    });
  }, [searchKeyword, props.data, props.columns]);

  return (
    <div>
      {props.filters === undefined && disableSearch ? (
        <></>
      ) : (
        <div className="row">
          <div className="col-auto">{props.filters === undefined ? <></> : <props.filters />}</div>
          <div className="col-sm">
            {disableSearch ? (
              <></>
            ) : (
              <div className="d-flex">
                <div className="ml-auto">
                  <input
                    onChange={(event: any) => {
                      setSearchKeyword(event.target.value.toLowerCase());
                    }}
                    className="form-control"
                    type="text"
                    placeholder="Search ..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-2">
        <ReactTable
          {...props}
          showPagination={showPagination}
          className={`-striped -highlight oncokbReactTable ${props.fixedHeight ? 'fixedHeight' : ''} ${props.className}`}
          data={filteredData}
          defaultPageSize={10}
        />
      </div>
    </div>
  );
};

export default OncoKBTable;
