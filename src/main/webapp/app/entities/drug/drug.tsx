import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { filterByKeyword, getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';

const defaultPaginationState: PaginationState<IDrug> = {
  order: 'asc',
  sort: 'name',
  activePage: 1,
};

export interface IDrugProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Drug = (props: IDrugProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const drugList = props.drugList;

  const columns: SearchColumn<IDrug>[] = [
    {
      accessor: 'uuid',
      Header: 'UUID',
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.uuid, keyword),
    },
    {
      accessor: 'name',
      Header: 'Name',
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.name, keyword),
    },
    {
      id: 'code',
      Header: 'Code',
      Cell(cell: { original }): JSX.Element {
        return cell.original.nciThesaurus ? cell.original.nciThesaurus.code : '';
      },
      onFilter: (data: IDrug, keyword) => filterByKeyword(data.nciThesaurus?.code || '', keyword),
    },
    getEntityTableActionsColumn(ENTITY_TYPE.DRUG),
  ];

  return (
    <div>
      <h2 id="drug-heading" data-cy="DrugHeading">
        Drugs
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>{drugList && <OncoKBTable data={props.drugList.concat()} columns={columns} loading={props.loading} showPagination />}</div>
    </div>
  );
};

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugList: drugStore.entities,
  loading: drugStore.loading,
  totalItems: drugStore.totalItems,
  getEntities: drugStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Drug);
