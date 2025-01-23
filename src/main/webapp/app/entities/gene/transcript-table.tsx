import React, { useEffect, useMemo, useState } from 'react';
import { Column } from 'react-table';
import { ITranscript } from 'app/shared/model/transcript.model';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FlagBadge from 'app/shared/badge/FlagBadge';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { Input } from 'reactstrap';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { mapIdList } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const apiUrl = getEntityResourcePath(ENTITY_TYPE.TRANSCRIPT);

export interface IGeneTranscriptsProps extends StoreProps {
  ensemblGeneId: number | undefined;
  selectedTranscriptIds: number[];
  onToggleTranscript: (transcript: ITranscript) => void;
  disableTranscriptAlignment: boolean;
}

const TranscriptTable = (props: IGeneTranscriptsProps) => {
  const [transcriptList, setTranscriptList] = useState<ITranscript[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  useEffect(() => {
    props.getFlags({});
  }, []);

  useEffect(() => {
    fetchTranscripts();
  }, [props.ensemblGeneId]);

  const fetchTranscripts = () => {
    setLoadingTranscripts(true);
    axios
      .get<ITranscript[]>(`${apiUrl}?ensemblGeneId.equals=${props.ensemblGeneId}`)
      .then(response => {
        setTranscriptList(response.data);
      })
      .finally(() => {
        setLoadingTranscripts(false);
      });
  };

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

  const hasCanonicalTranscript = useMemo(() => {
    return !!transcriptList.find(t => t.canonical);
  }, [transcriptList]);

  const handleCanonicalTranscriptChange = (transcript: ITranscript) => {
    const isCanonical = !transcript.canonical; // Toggle canonical status
    const oncokbCanonicalFlag = props.flags.find(f => f.flag === 'ONCOKB' && f.name === 'OncoKB Canonical');
    if (!oncokbCanonicalFlag) {
      notifyError(new Error('Cannot find OncoKB Canonical flag'));
      return;
    }
    const existingFlagIds = mapIdList(transcript.flags?.map(flag => flag.id) ?? []);
    let updatedFlagIds;
    if (isCanonical) {
      updatedFlagIds = [...existingFlagIds, { id: oncokbCanonicalFlag.id }];
    } else {
      updatedFlagIds = existingFlagIds.filter(flag => flag.id === oncokbCanonicalFlag.id);
    }

    const newTranscript: ITranscript = {
      ...transcript,
      canonical: isCanonical,
      flags: updatedFlagIds,
    };

    props.updateTranscript(newTranscript).then(() => {
      fetchTranscripts();
    });
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
      Header: (
        <div>
          Is Canonical <InfoIcon overlay={'Only one transcript should be marked as OncoKB canonical transcript'}></InfoIcon>
        </div>
      ),
      Cell(cell: { original: ITranscript }) {
        return (
          <div>
            <Input
              type="checkbox"
              checked={cell.original.canonical}
              disabled={hasCanonicalTranscript && !cell.original.canonical}
              onChange={() => handleCanonicalTranscriptChange(cell.original)}
            />
          </div>
        );
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
        return (
          <div>
            {(cell.original.flags || []).map(flag => (
              <FlagBadge key={flag.flag} flag={flag} tagClassName={'me-1'} />
            ))}
          </div>
        );
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
            {cell.original.id ? getComparisonOrder(cell.original.id) : undefined}
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

const mapStoreToProps = (storeState: IRootStore) => ({
  flags: storeState.flagStore.entities,
  getFlags: storeState.flagStore.getEntities,
  updateTranscript: storeState.transcriptStore.updateEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TranscriptTable);
