import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ISynonym } from 'app/shared/model/synonym.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { Column } from 'react-table';
import { IDrug } from 'app/shared/model/drug.model';

const defaultPaginationState: PaginationState<ISynonym> = {
  order: 'asc',
  sort: 'name',
  activePage: 1,
};

export interface ISynonymProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Synonym = (props: ISynonymProps) => {
  const columns: Column<IDrug>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'source', Header: 'Source' },
    { accessor: 'code', Header: 'Code' },
    { accessor: 'name', Header: 'Name' },
    { accessor: 'note', Header: 'Note' },
    getEntityTableActionsColumn(ENTITY_TYPE.SYNONYM),
  ];

  return (
    <div>
      <h2 id="synonym-heading" data-cy="SynonymHeading">
        Synonyms
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.SYNONYM} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.synonymList && (
          <OncoKBAsyncTable
            data={props.synonymList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search) || defaultPaginationState}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ synonymStore }: IRootStore) => ({
  synonymList: synonymStore.entities,
  loading: synonymStore.loading,
  totalItems: synonymStore.totalItems,
  searchEntities: synonymStore.searchEntities,
  getEntities: synonymStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Synonym);
