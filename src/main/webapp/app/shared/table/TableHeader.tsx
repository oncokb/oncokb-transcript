import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { IPaginationBaseState } from 'react-jhipster';
import { ASC } from '../util/pagination.constants';

interface ITableHeaderProps {
  header: string;
  onSort?: () => void;
  paginationState?: IPaginationBaseState;
  sortField?: string;
}

export const TableHeader: React.FunctionComponent<ITableHeaderProps> = props => {
  const isSortUp = props.paginationState?.sort === props.sortField && props.paginationState?.order === ASC ? faSortUp : faSortDown;
  return (
    <div onClick={props.onSort} style={{ cursor: 'pointer' }}>
      {props.header} <FontAwesomeIcon icon={isSortUp} />
    </div>
  );
};
