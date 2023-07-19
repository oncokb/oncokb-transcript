import React, { useEffect, useState } from 'react';
import { connect } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionNumber } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import OncoKBTable from './OncoKBTable';
import { IDeviceUsageIndication } from '../model/device-usage-indication.model';
import { Column } from 'react-table';
import { getCancerTypeName } from '../util/utils';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import CompactButton from '../button/CompactButton';
import { SimpleConfirmModal } from '../modal/SimpleConfirmModal';

interface CdxBiomarkerAssociationTableProps extends StoreProps {
  editable?: boolean;
  companionDiagnosticDeviceId: number;
}

export const CdxBiomarkerAssociationTable: React.FunctionComponent<CdxBiomarkerAssociationTableProps> = props => {
  const [indications, setIndications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [indicationToDeleteId, setIndicationToDeleteId] = useState(null);

  useEffect(() => {
    if (props.companionDiagnosticDeviceId) {
      const getIndications = async () => {
        const result = await props.getCdxIndications(props.companionDiagnosticDeviceId);
        setIndications(result);
      };
      getIndications();
    }
  }, [props.companionDiagnosticDeviceId]);

  const handleDeleteIndication = () => {
    if (indicationToDeleteId) {
      props.deleteEntity(indicationToDeleteId);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setIndicationToDeleteId(null);
  };

  const columns: Column<IDeviceUsageIndication>[] = [
    {
      id: 'gene',
      Header: 'Gene',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return <div>{original.gene?.hugoSymbol}</div>;
      },
    },
    {
      id: 'alterations',
      Header: 'Alterations',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return (
          <>
            {original.alterations &&
              original.alterations
                .map(alteration => alteration.name)
                .sort()
                .join(', ')}
          </>
        );
      },
    },
    {
      id: 'cancerType',
      Header: 'Cancer Type',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return <div>{getCancerTypeName(original.cancerType)}</div>;
      },
    },
    {
      id: 'drugs',
      Header: 'Drug',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return (
          <>
            {original.drugs &&
              original.drugs
                .map(drug => drug.name)
                .sort()
                .join(' + ')}
          </>
        );
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return (
          <>
            {original.fdaSubmissions &&
              original.fdaSubmissions
                .map(sub => getFdaSubmissionNumber(sub.number, sub.supplementNumber))
                .sort()
                .join(', ')}
          </>
        );
      },
    },
  ];

  if (props.editable) {
    columns.push({
      id: 'remove',
      Header: 'Remove',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IDeviceUsageIndication } };
      }): any {
        return (
          <>
            <CompactButton
              text="Delete"
              icon={faTrashAlt}
              color="danger"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setIndicationToDeleteId(original.id);
              }}
            />
          </>
        );
      },
      width: 50,
    });
  }

  return (
    <>
      <h4>Biomarker Associations</h4>
      <OncoKBTable columns={columns} data={indications} loading={props.loading} />
      <SimpleConfirmModal
        show={showModal}
        onCancel={handleCancel}
        onConfirm={handleDeleteIndication}
        body={'Are you sure you want to delete this association?'}
      />
    </>
  );
};

const mapStoreToProps = ({ deviceUsageIndicationStore }: IRootStore) => ({
  deleteEntity: deviceUsageIndicationStore.deleteEntity,
  getCdxIndications: deviceUsageIndicationStore.getCdxIndications,
  loading: deviceUsageIndicationStore.loading,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CdxBiomarkerAssociationTable);
