import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';

export interface INciThesaurusProps extends StoreProps, RouteComponentProps<{ url: string }> {}

const defaultPaginationState: PaginationState<INciThesaurus> = {
  order: 'asc',
  sort: 'id',
  activePage: 1,
};

export const NciThesaurus = (props: INciThesaurusProps) => {
  const columns: Column<INciThesaurus>[] = [
    { accessor: 'version', Header: 'Version' },
    { accessor: 'code', Header: 'Code' },
    { accessor: 'preferredName', Header: 'Preferred Name' },
    { accessor: 'displayName', Header: 'Display Name' },
    getEntityTableActionsColumn(ENTITY_TYPE.NCI_THESAURUS),
  ];

  return (
    <div>
      <h2 id="nci-thesaurus-heading" data-cy="NciThesaurusHeading">
        NCI Thesauruses
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.NCI_THESAURUS} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div className="table-responsive">
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mapStoreToProps && (
            <OncoKBAsyncTable
              data={props.nciThesaurusList.concat()}
              columns={columns}
              loading={props.loading}
              initialPaginationState={getPaginationFromSearchParams(props.location.search) || defaultPaginationState}
              searchEntities={props.searchEntities}
              getEntities={props.getEntities}
              totalItems={props.totalItems}
            />
          )
        }
      </div>
    </div>
  );
};

const mapStoreToProps = ({ nciThesaurusStore }: IRootStore) => ({
  nciThesaurusList: nciThesaurusStore.entities,
  loading: nciThesaurusStore.loading,
  totalItems: nciThesaurusStore.totalItems,
  searchEntities: nciThesaurusStore.searchEntities,
  getEntities: nciThesaurusStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(NciThesaurus);
