import React, { useMemo } from 'react';
import { Table } from 'reactstrap';
import { Column, useFlexLayout, useTable } from 'react-table';
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
      minWidth: 20,
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
      <tr {...row.getRowProps()}>
        {row.cells.map(cell => {
          return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
        })}
      </tr>
    );
  });

  const getTableContents = () => {
    if (props.loading) {
      return (
        <tr>
          <td colSpan={columns.length}>
            <div className="table-message">
              <LoadingIndicator isLoading={true} />
            </div>
          </td>
        </tr>
      );
    } else if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length}>
            <div className="table-message">No rows found</div>
          </td>
        </tr>
      );
    } else {
      return tableRows;
    }
  };

  return (
    <Table striped bordered hover {...getTableProps()} className="oncokb-table">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              const { render, getHeaderProps } = column;
              return <th {...getHeaderProps()}>{render('Header')}</th>;
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>{getTableContents()}</tbody>
    </Table>
  );
};

export default OncoKBTable;
