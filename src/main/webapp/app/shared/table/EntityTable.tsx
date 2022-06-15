import React from 'react';
import { Column } from 'react-table';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import OncoKBTable from './OncoKBTable';
import EntityActionButton from '../button/EntityActionButton';

type EntityTableProps = {
  columns: Column[];
  data: ReadonlyArray<any>;
  loading?: boolean;
  url: string;
  curatable?: boolean;
  entityType: ENTITY_TYPE;
};

const getEntityId = (entity: any, entityType: ENTITY_TYPE) => {
  return entityType === ENTITY_TYPE.USER ? entity.login : entity.id;
};

export const EntityTable: React.FunctionComponent<EntityTableProps> = props => {
  const { columns, url, entityType, ...tableProps } = props;
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
        const entityId = getEntityId(original, entityType);
        return (
          <div className="btn-group flex-btn-group-container">
            {props.curatable && (
              <EntityActionButton
                color="primary"
                size="sm"
                entityId={entityId}
                entityType={entityType}
                entityAction={ENTITY_ACTION.CURATE}
              />
            )}
            <EntityActionButton color="info" size="sm" entityId={entityId} entityType={entityType} entityAction={ENTITY_ACTION.VIEW} />
            <EntityActionButton color="primary" size="sm" entityId={entityId} entityType={entityType} entityAction={ENTITY_ACTION.EDIT} />
            <EntityActionButton color="danger" size="sm" entityId={entityId} entityType={entityType} entityAction={ENTITY_ACTION.DELETE} />
          </div>
        );
      },
    },
  ];
  return <OncoKBTable {...tableProps} columns={newColumns}></OncoKBTable>;
};

export default EntityTable;
