import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import { getEntityTableActionsColumn, getGeneName, getGenomicLocation, getPaginationFromSearchParams } from 'app/shared/util/utils';

const defaultPaginationState: PaginationState<IEnsemblGene> = {
  order: 'asc',
  sort: 'ensemblGeneId',
  activePage: 1,
};

export interface IEnsemblGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const EnsemblGene = (props: IEnsemblGeneProps) => {
  const ensemblGeneList = props.ensemblGeneList;

  const columns: Column<IEnsemblGene>[] = [
    {
      accessor: 'id',
      Header: 'Id',
      maxWidth: 60,
      minWidth: 60,
    },
    {
      accessor: 'ensemblGeneId',
      Header: 'Ensembl Gene Id',
      Cell(cell: { original: IEnsemblGene }) {
        return (
          <div>
            {cell.original.ensemblGeneId} ({cell.original.referenceGenome})
          </div>
        );
      },
    },
    {
      accessor: 'canonical',
      Header: 'Canonical',
      Cell(cell: { original: IEnsemblGene }) {
        return `${cell.original.canonical}`;
      },
    },
    {
      id: 'segRegion',
      accessor: 'seqRegion',
      Header: 'Seg Region',
      Cell(cell: { original: IEnsemblGene }) {
        return cell.original.seqRegion?.name;
      },
    },
    {
      id: 'location',
      Header: 'Location',
      Cell(cell: { original: IEnsemblGene }) {
        return <div>{getGenomicLocation(cell.original)}</div>;
      },
    },
    {
      id: 'gene',
      Header: 'Gene',
      Cell(cell: { original: IEnsemblGene }) {
        return <>{cell.original.gene && <div>{getGeneName(cell.original.gene)}</div>}</>;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.ENSEMBL_GENE),
  ];

  return (
    <div>
      <h2 id="ensembl-gene-heading" data-cy="EnsemblGeneHeading">
        Ensembl Genes
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.ENSEMBL_GENE} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>
        {ensemblGeneList && (
          <OncoKBAsyncTable
            data={ensemblGeneList.concat()}
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

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  ensemblGeneList: ensemblGeneStore.entities,
  loading: ensemblGeneStore.loading,
  totalItems: ensemblGeneStore.totalItems,
  getEntities: ensemblGeneStore.getEntities,
  searchEntities: ensemblGeneStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IEnsemblGeneProps, StoreProps>(mapStoreToProps)(EnsemblGene);
