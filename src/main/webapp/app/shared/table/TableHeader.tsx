import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ASC } from '../util/pagination.constants';

interface ITableHeaderProps {
  header: string;
  onSort?: () => void;
  sortDirection: string;
}

export const TableHeader: React.FunctionComponent<ITableHeaderProps> = props => {
  return (
    <div onClick={props.onSort} style={{ cursor: 'pointer' }}>
      {props.header} <FontAwesomeIcon icon={props.sortDirection === ASC ? faSortUp : faSortDown} />
    </div>
  );
};
