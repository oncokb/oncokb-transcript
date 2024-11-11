import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { IFeatureFlag } from 'app/shared/model/feature-flag.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword, getEntityTableActionsColumn } from 'app/shared/util/utils';

export interface IFeatureFlagProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FeatureFlag = (props: IFeatureFlagProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<IFeatureFlag>[] = [
    {
      accessor: 'name',
      Header: 'Name',
      onFilter: (data: IFeatureFlag, keyword) => filterByKeyword(data.name, keyword),
    },
    {
      accessor: 'description',
      Header: 'Description',
      onFilter: (data: IFeatureFlag, keyword) => filterByKeyword(data.description, keyword),
    },
    {
      accessor: 'enabled',
      Header: 'Enabled',
      Cell(cell: { original }) {
        return `${cell.original.enabled}`;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.FEATURE_FLAG),
  ];

  return (
    <div>
      <h2 id="feature-flag-heading" data-cy="FeatureFlagHeading">
        Feature Flag
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.FEATURE_FLAG} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.featureFlagList && (
          <OncoKBTable data={props.featureFlagList.concat()} columns={columns} loading={props.loading} showPagination />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ featureFlagStore }: IRootStore) => ({
  featureFlagList: featureFlagStore.entities,
  loading: featureFlagStore.loading,
  getEntities: featureFlagStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FeatureFlag);
