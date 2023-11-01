import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { ITranscript } from 'app/shared/model/transcript.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';

const defaultPaginationState: PaginationState<ITranscript> = {
  order: 'asc',
  sort: 'ensemblTranscriptId',
  activePage: 1,
};

export interface ITranscriptProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Transcript = (props: ITranscriptProps) => {
  const columns: Column<ITranscript>[] = [
    { accessor: 'referenceGenome', Header: 'Reference Genome' },
    {
      id: 'gene',
      Header: 'Gene',
      Cell(cell: { original }): JSX.Element {
        return cell.original.gene.hugoSymbol;
      },
    },
    { accessor: 'ensemblGeneId', Header: 'Ensembl Gene ID' },
    { accessor: 'ensemblTranscriptId', Header: 'Ensembl Transcript ID' },
    { accessor: 'canonical', Header: 'Is Canonical' },
    { accessor: 'ensemblProteinId', Header: 'Ensembl Protein ID' },
    { accessor: 'referenceSequenceId', Header: 'RefSeq' },
    getEntityTableActionsColumn(ENTITY_TYPE.TRANSCRIPT),
  ];
  return (
    <div>
      <h2 id="transcript-heading" data-cy="TranscriptHeading">
        Transcripts
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.TRANSCRIPT} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {props.transcriptList && (
          <OncoKBAsyncTable
            data={props.transcriptList.concat()}
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

const mapStoreToProps = ({ transcriptStore }: IRootStore) => ({
  transcriptList: transcriptStore.entities,
  loading: transcriptStore.loading,
  totalItems: transcriptStore.totalItems,
  searchEntities: transcriptStore.searchEntities,
  getEntities: transcriptStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Transcript);
