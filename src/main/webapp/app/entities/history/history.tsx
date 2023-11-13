import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IHistory } from 'app/shared/model/history.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';

export interface IHistoryProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const History = (props: IHistoryProps) => {
  const columns: Column<IHistory>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'updatedTime', Header: 'Updated Time' },
    { accessor: 'updatedBy', Header: 'Updated By' },
    { accessor: 'entityName', Header: 'Entity Name' },
    { accessor: 'entityId', Header: 'Entity ID' },
    getEntityTableActionsColumn(ENTITY_TYPE.HISTORY),
  ];

  return (
    <div>
      <h2 id="history-heading" data-cy="HistoryHeading">
        Histories
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.HISTORY} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.historyList && (
          <OncoKBAsyncTable
            data={props.historyList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search)}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ historyStore }: IRootStore) => ({
  historyList: historyStore.entities,
  loading: historyStore.loading,
  totalItems: historyStore.totalItems,
  getEntities: historyStore.getEntities,
  searchEntities: historyStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(History);
