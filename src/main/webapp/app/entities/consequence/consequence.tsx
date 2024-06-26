import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IConsequence } from 'app/shared/model/consequence.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IConsequenceProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Consequence = (props: IConsequenceProps) => {
  useEffect(() => {
    props.getEntities({});
  }, []);
  const columns: SearchColumn<IConsequence>[] = [
    { accessor: 'term', Header: 'Term' },
    { accessor: 'name', Header: 'Name' },
    {
      accessor: 'isGenerallyTruncating',
      Header: 'Generally Truncating',
      Cell(cell: { original }) {
        return `${cell.original.isGenerallyTruncating}`;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.CONSEQUENCE),
  ];

  return (
    <div>
      <h2 id="consequence-heading" data-cy="ConsequenceHeading">
        Consequences
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.CONSEQUENCE} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {props.consequenceList && (
          <OncoKBTable data={props.consequenceList.concat()} columns={columns} loading={props.loading} showPagination />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ consequenceStore }: IRootStore) => ({
  consequenceList: consequenceStore.entities,
  loading: consequenceStore.loading,
  getEntities: consequenceStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Consequence);
