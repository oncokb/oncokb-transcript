import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IClinicalTrialArm } from 'app/shared/model/clinical-trial-arm.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IClinicalTrialArmProps extends StoreProps, RouteComponentProps<{ url: string }> {}

const defaultPaginationState: PaginationState<IClinicalTrialArm> = {
  order: 'asc',
  sort: 'name',
  activePage: 1,
};

export const ClinicalTrialArm = (props: IClinicalTrialArmProps) => {
  const columns: Column<IClinicalTrialArm>[] = [
    { accessor: 'name', Header: 'Name' },
    getEntityTableActionsColumn(ENTITY_TYPE.CLINICAL_TRIAL_ARM),
  ];

  return (
    <div>
      <h2 id="clinical-trial-arm-heading" data-cy="ClinicalTrialArmHeading">
        Clinical Trial Arms
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.CLINICAL_TRIAL_ARM}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <div>
        {props.clinicalTrialArmList && (
          <OncoKBAsyncTable
            data={props.clinicalTrialArmList.concat()}
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

const mapStoreToProps = ({ clinicalTrialArmStore }: IRootStore) => ({
  clinicalTrialArmList: clinicalTrialArmStore.entities,
  loading: clinicalTrialArmStore.loading,
  totalItems: clinicalTrialArmStore.totalItems,
  searchEntities: clinicalTrialArmStore.searchEntities,
  getEntities: clinicalTrialArmStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialArm);
