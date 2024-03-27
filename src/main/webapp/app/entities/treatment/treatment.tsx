import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ITreatment } from 'app/shared/model/treatment.model';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { IGene } from 'app/shared/model/gene.model';
import GeneFlags from 'app/entities/gene/gene-flags';
import { getEntityTableActionsColumn, getPaginationFromSearchParams, getTreatmentName } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';

const defaultPaginationState: PaginationState<ITreatment> = {
  order: 'asc',
  sort: DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.TREATMENT] as keyof ITreatment,
  activePage: 1,
};

export interface ITreatmentProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Treatment = (props: ITreatmentProps) => {
  const treatmentList = props.treatmentList;

  const columns: Column<ITreatment>[] = [
    {
      accessor: 'name',
      Header: 'Name',
    },
    {
      id: 'id',
      Header: 'Drugs',
      Cell(cell: { original }) {
        return getTreatmentName([cell.original]);
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.TREATMENT),
  ];

  return (
    <div>
      <h2 id="gene-heading" data-cy="GeneHeading">
        Treatments
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.TREATMENT} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {treatmentList && (
          <OncoKBAsyncTable
            data={treatmentList.concat()}
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

const mapStoreToProps = ({ treatmentStore }: IRootStore) => ({
  treatmentList: treatmentStore.entities,
  loading: treatmentStore.loading,
  totalItems: treatmentStore.totalItems,
  searchEntities: treatmentStore.searchEntities,
  getEntities: treatmentStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Treatment);
