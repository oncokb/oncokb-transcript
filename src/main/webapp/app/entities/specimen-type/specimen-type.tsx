import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { ISpecimenType } from 'app/shared/model/specimen-type.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import EntityTable from 'app/shared/table/EntityTable';
export interface ISpecimenTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const SpecimenType = (props: ISpecimenTypeProps) => {
  const specimenTypeList = props.specimenTypeList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const { match } = props;

  const columns: Column<ISpecimenType>[] = [
    { accessor: 'type', Header: 'Type', width: 250 },
    { accessor: 'name', Header: 'Name', width: 250 },
  ];

  return (
    <div>
      <h2 id="specimen-type-heading" data-cy="SpecimenTypeHeading">
        Specimen Types
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.SPECIMEN_TYPE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {specimenTypeList && (
          <EntityTable columns={columns} data={specimenTypeList} loading={loading} url={match.url} entityType={ENTITY_TYPE.SPECIMEN_TYPE} />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ specimenTypeStore }: IRootStore) => ({
  specimenTypeList: specimenTypeStore.entities,
  loading: specimenTypeStore.loading,
  getEntities: specimenTypeStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SpecimenType);
