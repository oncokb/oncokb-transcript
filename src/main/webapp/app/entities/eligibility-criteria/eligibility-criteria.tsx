import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IEligibilityCriteria } from 'app/shared/model/eligibility-criteria.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
const defaultPaginationState: PaginationState<IEligibilityCriteria> = {
  sort: 'id',
  order: 'asc',
  activePage: 1,
};
export interface IEligibilityCriteriaProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const EligibilityCriteria = (props: IEligibilityCriteriaProps) => {
  const columns: Column<IEligibilityCriteria>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'priority', Header: 'Priority' },
    { accessor: 'criteria', Header: 'Criteria' },
    getEntityTableActionsColumn(ENTITY_TYPE.ELIGIBILITY_CRITERIA),
  ];

  return (
    <div>
      <h2 id="eligibility-criteria-heading" data-cy="EligibilityCriteriaHeading">
        Eligibility Criteria
        <EntityActionButton
          className="ms-2"
          color="primary"
          entityType={ENTITY_TYPE.ELIGIBILITY_CRITERIA}
          entityAction={ENTITY_ACTION.ADD}
        />
      </h2>
      <div>
        {props.eligibilityCriteriaList && (
          <OncoKBAsyncTable
            data={props.eligibilityCriteriaList.concat()}
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

const mapStoreToProps = ({ eligibilityCriteriaStore }: IRootStore) => ({
  eligibilityCriteriaList: eligibilityCriteriaStore.entities,
  loading: eligibilityCriteriaStore.loading,
  totalItems: eligibilityCriteriaStore.totalItems,
  getEntities: eligibilityCriteriaStore.getEntities,
  searchEntities: eligibilityCriteriaStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EligibilityCriteria);
