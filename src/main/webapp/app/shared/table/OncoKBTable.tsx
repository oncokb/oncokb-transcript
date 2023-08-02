import React, { useMemo } from 'react';
import { Table } from 'reactstrap';
import { Column, useAbsoluteLayout, useBlockLayout, useFlexLayout, useResizeColumns, useTable } from 'react-table';
import './OncoKBTable.scss';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';

export type IOncoKBTableProps<T> = {
  columns: Column[];
  data: T[];
  loading?: boolean;
};

// The keys are supplied by react-table
/* eslint-disable react/jsx-key */
const OncoKBTable = props => {
  const columns = useMemo(() => props.columns, [props.columns]);
  const data = useMemo(() => props.data, [props.data]);
  const defaultColumn = React.useMemo(
    () => ({
      width: 150,
      maxWidth: 500,
      minWidth: 150,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFlexLayout
  );

  const tableRows = rows.map(row => {
    prepareRow(row);
    return (
      <div className="rt-tr" {...row.getRowProps()}>
        {row.cells.map(cell => {
          return (
            <div className="rt-td" {...cell.getCellProps()}>
              {cell.render('Cell')}
            </div>
          );
        })}
      </div>
    );
  });

  const getTableContents = () => {
    if (props.loading) {
      return (
        <div className="rt-tr">
          <div className="rt-td">
            <div className="table-message">
              <LoadingIndicator isLoading={true} />
            </div>
          </div>
        </div>
      );
    } else if (data.length === 0) {
      return (
        <div className="rt-tr">
          <div className="rt-td">
            <div className="table-message">No rows found</div>
          </div>
        </div>
      );
    } else {
      return tableRows;
    }
  };

  return (
    <div {...getTableProps()} className="oncokb-table">
      <div className="rt-table">
        {headerGroups.map(headerGroup => (
          <div className="rt-thead" {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              const { render, getHeaderProps } = column;
              return (
                <div className="rt-th" {...getHeaderProps()}>
                  {render('Header')}
                </div>
              );
            })}
          </div>
        ))}
        <div {...getTableBodyProps()}>{getTableContents()}</div>
      </div>
    </div>
  );
};

export default OncoKBTable;
