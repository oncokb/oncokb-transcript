import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IInfo } from 'app/shared/model/info.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface IInfoProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Info = (props: IInfoProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<IInfo>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'value', Header: 'Value' },
    { accessor: 'created', Header: 'Created' },
    { accessor: 'lastUpdated', Header: 'Last Updated' },
    getEntityTableActionsColumn(ENTITY_TYPE.INFO),
  ];

  return (
    <div>
      <h2 id="info-heading" data-cy="InfoHeading">
        Infos
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.INFO} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>{props.infoList && <OncoKBTable data={props.infoList.concat()} columns={columns} loading={props.loading} showPagination />}</div>
    </div>
  );
};

const mapStoreToProps = ({ infoStore }: IRootStore) => ({
  infoList: infoStore.entities,
  loading: infoStore.loading,
  getEntities: infoStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Info);
