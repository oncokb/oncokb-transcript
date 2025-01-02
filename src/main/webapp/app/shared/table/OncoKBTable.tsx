import React, { useMemo, useState, useRef } from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import FilterIconModal from './FilterIconModal';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
export type SearchColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
  disableHeaderFiltering?: boolean;
};

export interface ITableWithSearchBox<T> extends Partial<TableProps<T>> {
  data: T[];
  disableSearch?: boolean;
  fixedHeight?: boolean;
  pageSize?: number;
  minRows?: number;
  columns: SearchColumn<T>[];
  loading?: boolean;
  filters?: React.FunctionComponent;
  className?: string;
}

export const OncoKBTable = <T extends object>({ disableSearch = false, showPagination = false, ...props }: ITableWithSearchBox<T>) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{ [columnId: string]: Set<string> }>({});
  const tableRef = useRef(null);

  const filteredData = useMemo(() => {
    return props.data.filter((item: T) => {
      // Column filter
      const columnFilterResult = Object.entries(selectedFilters).every(([columnId, selectedValues]) => {
        if (selectedValues.size === 0) {
          return true;
        }
        return selectedValues.has(item[columnId]);
      });

      // Search filter
      const filterableColumns = props.columns.filter(column => !!column.onFilter);
      const keywordSearchResult =
        filterableColumns.length > 0 ? filterableColumns.some(column => column.onFilter?.(item, searchKeyword)) : true;

      return columnFilterResult && keywordSearchResult;
    });
  }, [searchKeyword, selectedFilters, props.data, props.columns]);

  const handleFilterChange = (columnId, selectedValues) => {
    setSelectedFilters(selections => ({
      ...selections,
      [columnId]: selectedValues,
    }));
  };

  const allUniqColumnData = useMemo(() => {
    const allColumnData = {};

    props.columns.forEach(column => {
      const columnId = String(column.accessor);
      allColumnData[columnId] = new Set();
    });

    props.data.forEach(item => {
      props.columns.forEach(column => {
        const columnId = String(column.accessor);
        if (item[columnId]) {
          allColumnData[columnId].add(String(item[columnId]));
        }
      });
    });

    return allColumnData;
  }, [props.data, props.columns]);

  const filterColumns = useMemo(() => {
    return props.columns.map(column => {
      const columnId = String(column.accessor);
      return {
        ...column,
        Header: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{column.Header}</span>
            {!column.disableHeaderFiltering && (
              <FilterIconModal
                id={columnId}
                tableRef={tableRef}
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

  return (
    <div id="oncokb-table" ref={tableRef}>
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
                <div className="ms-auto">
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
