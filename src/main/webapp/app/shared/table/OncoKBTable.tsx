import React, { useMemo, useState, useRef, useEffect } from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import { FilterIconModal } from './filters/FilterIconModal';
import { Button } from 'reactstrap';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { FilterTypes } from './filters/types';

export type ColumnFilterValue =
  | { type: FilterTypes.STRING; value: string }
  | { type: FilterTypes.NUMBER; value: number }
  | { type: FilterTypes.DATE; value: Date };

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
export type BaseColumn<T> = Column<T> & {
  onSearchFilter?: (data: T, keyword: string) => boolean; // Determines how to filter the table when using searchbox
  disableHeaderFiltering?: boolean;
};

export type StringFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.STRING;
  getColumnFilterValue?: (data: T) => string;
};

export type NumberFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.NUMBER;
  getColumnFilterValue?: (data: T) => number;
};

export type DateFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.DATE;
  getColumnFilterValue?: (data: T) => Date | undefined;
};

export type UnfilteredColumn<T> = BaseColumn<T> & {
  filterType?: undefined;
  getColumnFilterValue?: undefined;
};

export type FilterableColumn<T> = StringFilterColumn<T> | NumberFilterColumn<T> | DateFilterColumn<T> | UnfilteredColumn<T>;

export interface ITableWithSearchBox<T> extends Partial<TableProps<T>> {
  data: T[];
  disableSearch?: boolean;
  fixedHeight?: boolean;
  pageSize?: number;
  minRows?: number;
  columns: FilterableColumn<T>[];
  loading?: boolean;
  filters?: React.FunctionComponent;
  className?: string;
  handleDownload?: () => void;
}

export const OncoKBTable = <T extends object>({ disableSearch = false, showPagination = false, ...props }: ITableWithSearchBox<T>) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{ [columnId: string]: Set<string> | Set<Date> | Set<number> }>({});
  const tableRef = useRef(null);

  const filteredData = useMemo(() => {
    return props.data.filter((item: T) => {
      // Column filter
      const columnFilterResult = Object.entries(selectedFilters).every(([columnId, selectedValues]) => {
        if (selectedValues.size === 0) {
          return true;
        }

        const curColumn = props.columns.find(col => String(col.accessor || col.Header) === columnId);
        if (!curColumn) return true;

        const value = curColumn.getColumnFilterValue?.(item);

        switch (curColumn.filterType) {
          case FilterTypes.STRING:
            return typeof value === 'string' && (selectedValues as Set<string>).has(value);

          case FilterTypes.NUMBER:
            return typeof value === 'number' && [...selectedValues].some(v => Number(v) === value);

          case FilterTypes.DATE:
            if (value instanceof Date) {
              const [date1, second] = Array.from(selectedValues as Set<Date>);
              const date2 = second ?? date1;

              const start = new Date(date1 < date2 ? date1 : date2);
              const end = new Date(date1 >= date2 ? date1 : date2);

              start.setHours(0, 0, 0, 0);

              if (!second) {
                // If only one date is selected, set second date to end of day
                end.setHours(23, 59, 59, 999);
              } else {
                end.setHours(0, 0, 0, 0);
              }
              return value >= start && value <= end;
            }
            return false;
          default:
            // fallback to raw accessor
            if (curColumn.accessor && typeof curColumn.accessor === 'string') {
              return (selectedValues as Set<string>).has(item[String(curColumn.accessor)]);
            }
            return true;
        }
      });

      // Search filter
      const filterableColumns = props.columns.filter(column => !!column.onSearchFilter);
      const keywordSearchResult =
        filterableColumns.length > 0 ? filterableColumns.some(column => column.onSearchFilter?.(item, searchKeyword)) : true;

      return columnFilterResult && keywordSearchResult;
    });
  }, [searchKeyword, selectedFilters, props.data, props.columns]);

  const handleFilterChange = (columnId, selectedValues) => {
    setSelectedFilters(selections => ({
      ...selections,
      [columnId]: selectedValues,
    }));
  };

  const allUniqColumnData: { [columnId: string]: Set<string> | Set<number> | Set<Date> } = useMemo(() => {
    const allColumnData = {};

    props.columns.forEach(column => {
      const columnId = String(column.accessor || column.Header);
      allColumnData[columnId] = new Set();
    });

    props.data.forEach(item => {
      props.columns.forEach(column => {
        const columnId = String(column.accessor || column.Header);
        if (column.getColumnFilterValue) {
          const filterValue = column.getColumnFilterValue(item);
          if (filterValue) {
            allColumnData[columnId].add(column.getColumnFilterValue(item));
          }
        } else if (column.accessor) {
          if (typeof column.accessor === 'string') {
            allColumnData[columnId].add(String(item[String(column.accessor)]));
          }
        }
      });
    });

    return allColumnData;
  }, [props.data, props.columns]);

  const filterColumns = useMemo(() => {
    return props.columns.map(column => {
      const columnId = String(column.accessor || column.Header);
      return {
        ...column,
        Header: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{column.Header}</span>
            {!column.disableHeaderFiltering && (
              <FilterIconModal
                id={columnId}
                filterType={column.filterType ?? FilterTypes.STRING}
                allSelections={allUniqColumnData[columnId]}
                currSelections={selectedFilters[columnId] || new Set()}
                updateSelections={newSelections => handleFilterChange(columnId, newSelections)}
              />
            )}
          </div>
        ),
      };
    });
  }, [props.columns, props.data, selectedFilters]);

  const hasAnyFilters = Object.values(selectedFilters).some(set => set.size > 0);

  return (
    <div id="oncokb-table" ref={tableRef}>
      <div className="row">
        <div className="col-auto">
          <div>
            {props.filters === undefined ? (
              <></>
            ) : (
              <div className="me-1">
                <props.filters />
              </div>
            )}
            {hasAnyFilters ? (
              <Button color="primary" outline onClick={() => setSelectedFilters({})}>
                Reset all filters
              </Button>
            ) : undefined}
          </div>
        </div>
        <div className="col-sm">
          <div className="d-flex justify-content-center">
            <div className="ms-auto d-flex">
              {props.handleDownload && (
                <Button color="primary" style={{ whiteSpace: 'nowrap' }} outline onClick={props.handleDownload}>
                  <FaCloudDownloadAlt className="me-2 mb-1" />
                  <span>Download</span>
                </Button>
              )}
              {!disableSearch && (
                <input
                  onChange={(event: any) => {
                    setSearchKeyword(event.target.value.toLowerCase());
                  }}
                  className="form-control ms-2"
                  type="text"
                  placeholder="Search ..."
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <ReactTable
          defaultPageSize={10}
          showPagination={showPagination}
          {...props}
          className={`-striped -highlight oncokbReactTable ${props.fixedHeight ? 'fixedHeight' : ''} ${props.className}`}
          data={filteredData}
          columns={filterColumns}
        />
      </div>
    </div>
  );
};

export default OncoKBTable;
