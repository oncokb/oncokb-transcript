import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable from 'app/shared/table/OncoKBAsyncTable';

export interface IFdaDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaDrug = (props: IFdaDrugProps) => {
  const columns: Column<IFdaDrug>[] = [
    { accessor: 'applicationNumber', Header: 'applicationNumber' },
    { accessor: 'drug', Header: 'drug' },
    getEntityTableActionsColumn(ENTITY_TYPE.FDA_DRUG),
  ];

  return (
    <div>
      <h2 id="fda-drug-heading" data-cy="FdaDrugHeading">
        Fda Drugs
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.FDA_DRUG} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.fdaDrugList && (
          <OncoKBAsyncTable
            data={props.fdaDrugList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search)}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ fdaDrugStore }: IRootStore) => ({
  fdaDrugList: fdaDrugStore.entities,
  loading: fdaDrugStore.loading,
  totalItems: fdaDrugStore.totalItems,
  searchEntities: fdaDrugStore.searchEntities,
  getEntities: fdaDrugStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaDrug);
