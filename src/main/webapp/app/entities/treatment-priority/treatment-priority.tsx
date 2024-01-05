import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { ITreatmentPriority } from 'app/shared/model/treatment-priority.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';

export interface ITreatmentPriorityProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const TreatmentPriority = (props: ITreatmentPriorityProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<ITreatmentPriority>[] = [
    { accessor: 'priority', Header: 'Priority' },
    { accessor: 'treatment', Header: 'Treatment' },
    getEntityTableActionsColumn(ENTITY_TYPE.TREATMENT_PRIORITY),
  ];

  return (
    <div>
      <h2 id="treatment-priority-heading" data-cy="TreatmentPriorityHeading">
        Treatment Priorities
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.TREATMENT_PRIORITY}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <div>
        {props.treatmentPriorityList && (
          <OncoKBTable data={props.treatmentPriorityList.concat()} columns={columns} loading={props.loading} />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ treatmentPriorityStore }: IRootStore) => ({
  treatmentPriorityList: treatmentPriorityStore.entities,
  loading: treatmentPriorityStore.loading,
  getEntities: treatmentPriorityStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentPriority);
