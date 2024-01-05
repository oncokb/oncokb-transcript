import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Column } from 'react-table';

export const FDA_SUBMISSION_TABLE_COLUMNS: Column<IFdaSubmission>[] = [
  {
    accessor: 'deviceName',
    Header: 'Device Name',
    minWidth: 300,
  },
  {
    accessor: 'number',
    Header: 'number',
  },
  {
    accessor: 'supplementNumber',
    Header: 'Supplement Number',
  },
  {
    accessor: 'platform',
    Header: 'Platform',
  },
  {
    accessor: 'genetic',
    Header: 'Genetic',
    Cell(cell: { original: IFdaSubmission }) {
      return cell.original ? <FontAwesomeIcon icon={faCheck} /> : null;
    },
    maxWidth: 75,
  },
  {
    accessor: 'curated',
    Header: 'Curated',
    Cell(cell: { original: IFdaSubmission }) {
      return cell.original ? <FontAwesomeIcon icon={faCheck} /> : null;
    },
    maxWidth: 75,
  },
  {
    accessor: 'type',
    Header: 'Type',
    Cell(cell: { original: IFdaSubmission }) {
      return cell.original.type?.shortName ? (
        <Link to={`/fda-submission-type/${cell.original.type.id}`}>{cell.original.type.shortName}</Link>
      ) : (
        <span></span>
      );
    },
    maxWidth: 100,
  },
  getEntityTableActionsColumn(ENTITY_TYPE.FDA_SUBMISSION),
];
