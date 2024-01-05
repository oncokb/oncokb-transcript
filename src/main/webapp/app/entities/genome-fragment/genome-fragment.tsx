import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import OncoKBAsyncTable from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IGenomeFragmentProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const GenomeFragment = (props: IGenomeFragmentProps) => {
  const columns: Column<IGenomeFragment>[] = [
    { accessor: 'start', Header: 'Start' },
    { accessor: 'end', Header: 'End' },
    { accessor: 'strand', Header: 'Strand' },
    { accessor: 'type', Header: 'Type' },
    { accessor: 'seqRegion', Header: 'Sequence Region' },
    getEntityTableActionsColumn(ENTITY_TYPE.GENOME_FRAGMENT),
  ];

  return (
    <div>
      <h2 id="genome-fragment-heading" data-cy="GenomeFragmentHeading">
        Genome Fragments
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.GENOME_FRAGMENT} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.genomeFragmentList && (
          <OncoKBAsyncTable
            data={props.genomeFragmentList.concat()}
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

const mapStoreToProps = ({ genomeFragmentStore }: IRootStore) => ({
  genomeFragmentList: genomeFragmentStore.entities,
  loading: genomeFragmentStore.loading,
  totalItems: genomeFragmentStore.totalItems,
  getEntities: genomeFragmentStore.getEntities,
  searchEntities: genomeFragmentStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomeFragment);
