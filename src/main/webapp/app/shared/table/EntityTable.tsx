import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';
import { Column } from 'react-table';
import { Button } from 'reactstrap';
import OncoKBTable from './OncoKBTable';

type EntityTableProps = {
  columns: Column[];
  data: ReadonlyArray<any>;
  loading?: boolean;
  url: string;
};

export const EntityTable: React.FunctionComponent<EntityTableProps> = props => {
  const { columns, url, ...tableProps } = props;
  const newColumns = [
    ...columns,
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
            <Button tag={Link} to={`${url}/${original.id}`} color="info" size="sm" data-cy="entityDetailsButton">
              <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
            </Button>
            <Button tag={Link} to={`${url}/${original.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
              <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
            </Button>
            <Button tag={Link} to={`${url}/${original.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
              <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];
  return <OncoKBTable {...tableProps} columns={newColumns}></OncoKBTable>;
};

export default EntityTable;
