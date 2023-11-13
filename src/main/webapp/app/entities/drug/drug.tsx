import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';

const defaultPaginationState: PaginationState<IDrug> = {
  order: 'asc',
  sort: 'name',
  activePage: 1,
};

export interface IDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Drug = (props: IDrugProps) => {
  const drugList = props.drugList;

  const columns: Column<IDrug>[] = [
    { accessor: 'name', Header: 'Name' },
    {
      id: 'code',
      Header: 'Code',
      Cell(cell: { original }): JSX.Element {
        return cell.original.nciThesaurus ? cell.original.nciThesaurus.code : '';
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG),
  ];

  return (
    <div>
      <h2 id="drug-heading" data-cy="DrugHeading">
        Drugs
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {drugList && (
          <OncoKBAsyncTable
            data={props.drugList.concat()}
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

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugList: drugStore.entities,
  loading: drugStore.loading,
  totalItems: drugStore.totalItems,
  searchEntities: drugStore.searchEntities,
  getEntities: drugStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Drug);
