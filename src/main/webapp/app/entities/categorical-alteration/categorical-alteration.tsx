import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { FilterableColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword, getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface ICategoricalAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CategoricalAlteration = (props: ICategoricalAlterationProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: FilterableColumn<ICategoricalAlteration>[] = [
    {
      accessor: 'alterationType',
      Header: 'Alteration Type',
      onSearchFilter: (data: ICategoricalAlteration, keyword) => filterByKeyword(data.alterationType, keyword),
    },
    {
      accessor: 'type',
      Header: 'Type',
      onSearchFilter: (data: ICategoricalAlteration, keyword) => filterByKeyword(data.type, keyword),
    },
    {
      accessor: 'name',
      Header: 'Name',
      onSearchFilter: (data: ICategoricalAlteration, keyword) => filterByKeyword(data.name, keyword),
    },
    {
      accessor: 'consequence.term',
      Header: 'Consequence',
      Cell(cell: { original: ICategoricalAlteration }) {
        return cell.original.consequence ? cell.original.consequence.term : '';
      },
      onSearchFilter: (data: ICategoricalAlteration, keyword) =>
        data.consequence ? filterByKeyword(data.consequence.term, keyword) : false,
    },
    getEntityTableActionsColumn(ENTITY_TYPE.CATEGORICAL_ALTERATION),
  ];

  return (
    <div>
      <h2 id="categorical-alteration-heading" data-cy="CategoricalAlterationHeading">
        Categorical Alterations
        <EntityActionButton
          className="ms-2"
          color="primary"
          entityType={ENTITY_TYPE.CATEGORICAL_ALTERATION}
          entityAction={ENTITY_ACTION.ADD}
        />
      </h2>
      <div>
        {props.categoricalAlterationList && (
          <OncoKBTable data={props.categoricalAlterationList.concat()} columns={columns} loading={props.loading} showPagination />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ categoricalAlterationStore }: IRootStore) => ({
  categoricalAlterationList: categoricalAlterationStore.entities,
  loading: categoricalAlterationStore.loading,
  getEntities: categoricalAlterationStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlteration);
