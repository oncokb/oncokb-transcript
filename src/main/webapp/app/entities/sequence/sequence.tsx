import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ISequence } from 'app/shared/model/sequence.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';

const defaultPaginationState: PaginationState<ISequence> = {
  order: 'asc',
  sort: 'id',
  activePage: 1,
};

export interface ISequenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Sequence = (props: ISequenceProps) => {
  const columns: Column<ISequence>[] = [
    { accessor: 'sequenceType', Header: 'Type' },
    { accessor: 'sequence', Header: 'Sequence' },
    getEntityTableActionsColumn(ENTITY_TYPE.SEQUENCE),
  ];

  return (
    <div>
      <h2 id="sequence-heading" data-cy="SequenceHeading">
        Sequences
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.SEQUENCE} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.sequenceList && (
          <OncoKBAsyncTable
            data={props.sequenceList.concat()}
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

const mapStoreToProps = ({ sequenceStore }: IRootStore) => ({
  sequenceList: sequenceStore.entities,
  loading: sequenceStore.loading,
  totalItems: sequenceStore.totalItems,
  searchEntities: sequenceStore.searchEntities,
  getEntities: sequenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Sequence);
