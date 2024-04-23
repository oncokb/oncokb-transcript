import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IGene } from 'app/shared/model/gene.model';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import GeneFlags from 'app/entities/gene/gene-flags';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';

const defaultPaginationState: PaginationState<IGene> = {
  order: 'asc',
  sort: DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE] as keyof IGene,
  activePage: 1,
};

export interface IGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Gene = (props: IGeneProps) => {
  const geneList = props.geneList;

  const columns: Column<IGene>[] = [
    {
      accessor: 'entrezGeneId',
      Header: 'Entrez Gene Id',
    },
    {
      accessor: 'hugoSymbol',
      Header: 'Hugo Symbol',
    },
    {
      accessor: 'hgncId',
      Header: 'Hgnc Id',
    },
    {
      accessor: 'flags',
      Header: 'Flags',
      Cell(cell: { original: IGene }) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return <GeneFlags flags={cell.original.flags} />;
      },
      minWidth: 200,
    },
    getEntityTableActionsColumn(ENTITY_TYPE.GENE),
  ];

  return (
    <div>
      <h2 id="gene-heading" data-cy="GeneHeading">
        Genes
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.GENE} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {geneList && (
          <OncoKBAsyncTable
            data={geneList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search) || defaultPaginationState}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  geneList: geneStore.entities,
  loading: geneStore.loading,
  totalItems: geneStore.totalItems,
  searchEntities: geneStore.searchEntities,
  getEntities: geneStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Gene);
