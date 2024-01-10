import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IClinicalTrialProps extends StoreProps, RouteComponentProps<{ url: string }> {}

const defaultPaginationState: PaginationState<IClinicalTrial> = {
  order: 'asc',
  sort: 'phase',
  activePage: 1,
};

export const ClinicalTrial = (props: IClinicalTrialProps) => {
  const columns: Column<IClinicalTrial>[] = [
    { accessor: 'nctId', Header: 'NCT ID' },
    { accessor: 'briefTitle', Header: 'Title' },
    { accessor: 'phase', Header: 'Phase' },
    { accessor: 'status', Header: 'Status' },
    getEntityTableActionsColumn(ENTITY_TYPE.CLINICAL_TRIAL),
  ];

  return (
    <div>
      <h2 id="clinical-trial-heading" data-cy="ClinicalTrialHeading">
        Clinical Trials
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.CLINICAL_TRIAL} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.clinicalTrialList && (
          <OncoKBAsyncTable
            data={props.clinicalTrialList.concat()}
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

const mapStoreToProps = ({ clinicalTrialStore }: IRootStore) => ({
  clinicalTrialList: clinicalTrialStore.entities,
  loading: clinicalTrialStore.loading,
  totalItems: clinicalTrialStore.totalItems,
  searchEntities: clinicalTrialStore.searchEntities,
  getEntities: clinicalTrialStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrial);
