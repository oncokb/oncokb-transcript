import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';

export interface IDrugBrandProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const DrugBrand = (props: IDrugBrandProps) => {
  const columns: Column<IDrugBrand>[] = [
    { accessor: 'name', Header: 'Name' },
    { accessor: 'region', Header: 'Region' },
    { accessor: 'drug', Header: 'Drug' },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG_BRAND),
  ];

  return (
    <div>
      <h2 id="drug-brand-heading" data-cy="DrugBrandHeading">
        Drug Brands
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG_BRAND} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.drugBrandList && (
          <OncoKBAsyncTable
            data={props.drugBrandList.concat()}
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

const mapStoreToProps = ({ drugBrandStore }: IRootStore) => ({
  drugBrandList: drugBrandStore.entities,
  loading: drugBrandStore.loading,
  totalItems: drugBrandStore.totalItems,
  getEntities: drugBrandStore.getEntities,
  searchEntities: drugBrandStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugBrand);
