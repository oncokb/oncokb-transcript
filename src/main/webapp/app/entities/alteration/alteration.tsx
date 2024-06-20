import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';

const defaultPaginationState: PaginationState<IAlteration> = {
  order: 'asc',
  sort: DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.ALTERATION] as keyof IAlteration,
  activePage: 1,
};

export interface IAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Alteration = (props: IAlterationProps) => {
  const alterationList = props.alterationList;

  const columns: Column<IAlteration>[] = [
    {
      accessor: 'genes',
      Header: 'Genes',
      Cell(cell: { original: IAlteration }) {
        return <span> {cell.original.genes?.map(gene => gene.hugoSymbol).join(', ')}</span>;
      },
    },
    {
      accessor: 'name',
      Header: 'Name',
    },
    {
      accessor: 'alteration',
      Header: 'Alteration',
    },
    getEntityTableActionsColumn(ENTITY_TYPE.ALTERATION),
  ];

  return (
    <div>
      <h2 id="alteration-heading" data-cy="AlterationHeading">
        Alterations
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.ALTERATION} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {alterationList && (
          <OncoKBAsyncTable
            data={alterationList.concat()}
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

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  alterationList: alterationStore.entities,
  loading: alterationStore.loading,
  totalItems: alterationStore.totalItems,
  searchEntities: alterationStore.searchEntities,
  getEntities: alterationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IAlterationProps, StoreProps>(mapStoreToProps)(Alteration);
