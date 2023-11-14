import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IClinicalTrialsGovCondition } from 'app/shared/model/clinical-trials-gov-condition.model';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { Column } from 'react-table';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';

const defaultPaginationState: PaginationState<IClinicalTrialsGovCondition> = {
  order: 'asc',
  sort: DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.CT_GOV_CONDITION] as keyof IClinicalTrialsGovCondition,
  activePage: 1,
};

export interface IClinicalTrialsGovConditionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const ClinicalTrialsGovCondition = (props: IClinicalTrialsGovConditionProps) => {
  const clinicalTrialsGovConditionList = props.clinicalTrialsGovConditionList;

  const columns: Column<IClinicalTrialsGovCondition>[] = [
    {
      accessor: 'name',
      Header: 'Name',
    },
    getEntityTableActionsColumn(ENTITY_TYPE.CT_GOV_CONDITION),
  ];

  return (
    <div>
      <h2 id="clinical-trials-gov-condition-heading" data-cy="ClinicalTrialsGovConditionHeading">
        CT.gov Conditions
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.CT_GOV_CONDITION}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <div className="table-responsive">
        {clinicalTrialsGovConditionList && (
          <OncoKBAsyncTable
            data={clinicalTrialsGovConditionList.concat()}
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

const mapStoreToProps = ({ clinicalTrialsGovConditionStore }: IRootStore) => ({
  clinicalTrialsGovConditionList: clinicalTrialsGovConditionStore.entities,
  loading: clinicalTrialsGovConditionStore.loading,
  totalItems: clinicalTrialsGovConditionStore.totalItems,
  searchEntities: clinicalTrialsGovConditionStore.searchEntities,
  getEntities: clinicalTrialsGovConditionStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialsGovCondition);
