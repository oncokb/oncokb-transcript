import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ICancerType } from 'app/shared/model/cancer-type.model';
import { ENTITY_ACTION, ENTITY_TYPE, APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable from 'app/shared/table/OncoKBAsyncTable';

export interface ICancerTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CancerType = (props: ICancerTypeProps) => {
  const columns: Column<ICancerType>[] = [
    { accessor: 'level', Header: 'Level' },
    { accessor: 'code', Header: 'Code' },
    { accessor: 'mainType', Header: 'Main Type' },
    { accessor: 'subtype', Header: 'Subtype' },
    { accessor: 'tissue', Header: 'Tissue' },
    { accessor: 'tumorForm', Header: 'Tumor Form' },
    { accessor: 'color', Header: 'color' },
    getEntityTableActionsColumn(ENTITY_TYPE.CANCER_TYPE),
  ];

  return (
    <div>
      <h2 id="cancer-type-heading" data-cy="CancerTypeHeading">
        Cancer Types
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.CANCER_TYPE} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.cancerTypeList && (
          <OncoKBAsyncTable
            data={props.cancerTypeList.concat()}
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

const mapStoreToProps = ({ cancerTypeStore }: IRootStore) => ({
  cancerTypeList: cancerTypeStore.entities,
  loading: cancerTypeStore.loading,
  totalItems: cancerTypeStore.totalItems,
  getEntities: cancerTypeStore.getEntities,
  searchEntities: cancerTypeStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CancerType);
