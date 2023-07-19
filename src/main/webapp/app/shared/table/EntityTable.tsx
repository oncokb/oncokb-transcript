import React from 'react';
import { Column } from 'react-table';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import OncoKBTable from './OncoKBTable';
import EntityActionButton from '../button/EntityActionButton';
import { IRootStore } from 'app/stores';
import { connect } from '../util/typed-inject';

type EntityTableProps = {
  columns: Column[];
  data: ReadonlyArray<any>;
  loading?: boolean;
  url: string;
  curatable?: boolean;
  entityType: ENTITY_TYPE;
} & StoreProps;

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
      minWidth: 100,
      Cell({
        cell: {
          row: { original },
        },
      }): any {
        const entityId = getEntityId(original, entityType);
        return (
          <div className="">
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

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  toggleCurationPanel: layoutStore.toggleCurationPanel,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EntityTable);
