import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IDrugPriority } from 'app/shared/model/drug-priority.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface IDrugPriorityProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const DrugPriority = (props: IDrugPriorityProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<IDrugPriority>[] = [
    { accessor: 'priority', Header: 'Priority' },
    { accessor: 'drug', Header: 'Drug' },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG_PRIORITY),
  ];

  return (
    <div>
      <h2 id="drug-priority-heading" data-cy="DrugPriorityHeading">
        Drug Priorities
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG_PRIORITY} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.drugPriorityList && <OncoKBTable data={props.drugPriorityList.concat()} columns={columns} loading={props.loading} />}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ drugPriorityStore }: IRootStore) => ({
  drugPriorityList: drugPriorityStore.entities,
  loading: drugPriorityStore.loading,
  getEntities: drugPriorityStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugPriority);
