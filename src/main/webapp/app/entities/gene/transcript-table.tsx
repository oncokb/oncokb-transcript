import React, { useEffect, useState } from 'react';
import { Column } from 'react-table';
import { ITranscript } from 'app/shared/model/transcript.model';
import axios from 'axios';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import FlagBadge from 'app/shared/badge/FlagBadge';

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
      Cell: ({
        cell: {
          row: { original },
        },
      }) => <Link to={`/transcript/${original.id}`}>{original.ensemblTranscriptId}</Link>,
    },
    {
      accessor: 'canonical',
      Header: 'Canonical',
      Cell: ({ cell: { value } }) => `${value}`,
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
      Cell: ({ cell: { value } }) => (
        <div>
          {value.map(flag => (
            <FlagBadge key={flag.flag} flag={flag} tagClassName={'mr-1'} />
          ))}
        </div>
      ),
    },
    {
      id: 'alignment',
      Header: 'Align Transcript',
      Cell: ({
        cell: {
          row: { original },
        },
      }) => (
        <div>
          <input
            type={'checkbox'}
            checked={props.selectedTranscriptIds.includes(original.id)}
            disabled={props.disableTranscriptAlignment}
            onChange={() => props.onToggleTranscript(original)}
          />{' '}
          {getComparisonOrder(original.id)}
        </div>
      ),
    },
  ];
  return (
    <>
      <div>{transcriptList && <OncoKBTable columns={columns} data={transcriptList} loading={loadingTranscripts}></OncoKBTable>}</div>
    </>
  );
};
