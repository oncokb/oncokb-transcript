import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { ISpecimenType } from 'app/shared/model/specimen-type.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable from 'app/shared/table/OncoKBTable';

export interface ISpecimenTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const SpecimenType = (props: ISpecimenTypeProps) => {
  const specimenTypeList = props.specimenTypeList;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: Column<ISpecimenType>[] = [
    { accessor: 'type', Header: 'Type' },
    { accessor: 'name', Header: 'Name' },
    getEntityTableActionsColumn(ENTITY_TYPE.SPECIMEN_TYPE),
  ];

  return (
    <div>
      <h2 id="specimen-type-heading" data-cy="SpecimenTypeHeading">
        Specimen Types
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.SPECIMEN_TYPE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {specimenTypeList && <OncoKBTable data={specimenTypeList.concat()} columns={columns} loading={props.loading} showPagination />}
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
