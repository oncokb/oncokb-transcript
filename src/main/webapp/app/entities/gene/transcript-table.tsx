import React, { useEffect, useState } from 'react';
import { Column } from 'react-table';
import { ITranscript } from 'app/shared/model/transcript.model';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FlagBadge from 'app/shared/badge/FlagBadge';
import OncoKBTable from 'app/shared/table/OncoKBTable';

const apiUrl = 'api/transcripts';

export interface IGeneTranscriptsProps {
  ensemblGeneId: number;
  selectedTranscriptIds: number[];
  onToggleTranscript: (transcript: ITranscript) => void;
  disableTranscriptAlignment: boolean;
}

export const TranscriptTable = (props: IGeneTranscriptsProps) => {
  const [transcriptList, setTranscriptList] = useState([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  useEffect(() => {
    setLoadingTranscripts(true);
    axios
      .get<ITranscript[]>(`${apiUrl}?ensemblGeneId.equals=${props.ensemblGeneId}`)
      .then(response => {
        setTranscriptList(response.data);
      })
      .finally(() => {
        setLoadingTranscripts(false);
      });
  }, [props.ensemblGeneId]);

  const getComparisonOrder = (id: number) => {
    if (props.selectedTranscriptIds.length === 0 || !props.selectedTranscriptIds.includes(id)) {
      return '';
    } else {
      const index = props.selectedTranscriptIds.indexOf(id);
      if (index === 0) {
        return 'Reference';
      } else {
        return `${index + 1}`;
      }
    }
  };

  const columns: Column<ITranscript>[] = [
    {
      Header: 'Ensembl Transcript ID',
      minWidth: 180,
      Cell(cell: { original: ITranscript }) {
        return <Link to={`/transcript/${cell.original.id}`}>{cell.original.ensemblTranscriptId}</Link>;
      },
    },
    {
      accessor: 'canonical',
      Header: 'Canonical',
      Cell(cell: { original: ITranscript }) {
        return `${cell.original.canonical}`;
      },
    },
    {
      accessor: 'ensemblProteinId',
      Header: 'Ensembl Protein ID',
      minWidth: 180,
    },
    {
      accessor: 'flags',
      Header: 'Flags',
      minWidth: 200,
      Cell(cell: { original: ITranscript }) {
        <div>
          {cell.original.flags.map(flag => (
            <FlagBadge key={flag.flag} flag={flag} tagClassName={'mr-1'} />
          ))}
        </div>;
      },
    },
    {
      id: 'alignment',
      Header: 'Align Transcript',
      Cell(cell: { original: ITranscript }) {
        return (
          <div>
            <input
              type={'checkbox'}
              checked={props.selectedTranscriptIds.includes(cell.original.id)}
              disabled={props.disableTranscriptAlignment}
              onChange={() => props.onToggleTranscript(cell.original)}
            />{' '}
            {getComparisonOrder(cell.original.id)}
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div>
        {transcriptList && (
          <OncoKBTable data={transcriptList.concat()} columns={columns} loading={loadingTranscripts} showPagination pageSize={5} />
        )}
      </div>
    </>
  );
};
