import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IFlag } from 'app/shared/model/flag.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';

const defaultPaginationState: PaginationState<IFlag> = {
  sort: 'id',
  order: 'asc',
  activePage: 1,
};

export interface IFlagProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Flag = (props: IFlagProps) => {
  const columns: Column<IFlag>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'flag', Header: 'Flag' },
    { accessor: 'name', Header: 'Name' },
    getEntityTableActionsColumn(ENTITY_TYPE.FLAG),
  ];

  return (
    <div>
      <h2 id="flag-heading" data-cy="FlagHeading">
        Flags
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.FLAG} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.flagList && (
          <OncoKBAsyncTable
            data={props.flagList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search) ?? defaultPaginationState}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ flagStore }: IRootStore) => ({
  flagList: flagStore.entities,
  loading: flagStore.loading,
  totalItems: flagStore.totalItems,
  getEntities: flagStore.getEntities,
  searchEntities: flagStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Flag);
