import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
export interface ICategoricalAlterationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const CategoricalAlteration = (props: ICategoricalAlterationProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);

  const columns: SearchColumn<ICategoricalAlteration>[] = [
    { accessor: 'alterationType', Header: 'Alteration Type' },
    { accessor: 'type', Header: 'Type' },
    { accessor: 'name', Header: 'Name' },
    { accessor: 'consequence', Header: 'Consequence' },
    getEntityTableActionsColumn(ENTITY_TYPE.CATEGORICAL_ALTERATION),
  ];

  return (
    <div>
      <h2 id="categorical-alteration-heading" data-cy="CategoricalAlterationHeading">
        Categorical Alterations
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.CATEGORICAL_ALTERATION}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <div>
        {props.categoricalAlterationList && (
          <OncoKBTable data={props.categoricalAlterationList.concat()} columns={columns} loading={props.loading} />
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
