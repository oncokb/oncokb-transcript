import React, { useEffect, useState } from 'react';
import { connect } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks, getFdaSubmissionNumber } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import OncoKBTable from './OncoKBTable';
import { IBiomarkerAssociation } from '../model/biomarker-association.model';
import { Column } from 'react-table';
import { getAlterationName, getCancerTypeName, getTreatmentName } from '../util/utils';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SimpleConfirmModal } from '../modal/SimpleConfirmModal';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CdxBiomarkerAssociationTableProps extends StoreProps {
  editable?: boolean;
  companionDiagnosticDeviceId: number;
}

export const CdxBiomarkerAssociationTable: React.FunctionComponent<CdxBiomarkerAssociationTableProps> = props => {
  const [showModal, setShowModal] = useState(false);
  const [currentBiomarkerAssociationId, setCurrentBiomarkerAssociationId] = useState(null);

  useEffect(() => {
    if (props.companionDiagnosticDeviceId) {
      props.getBiomarkerAssociations(props.companionDiagnosticDeviceId);
    }
  }, [props.companionDiagnosticDeviceId]);

  const handleDeleteIndication = () => {
    setShowModal(false);
    if (currentBiomarkerAssociationId) {
      props.deleteEntity(currentBiomarkerAssociationId).then(() => {
        props.getBiomarkerAssociations(props.companionDiagnosticDeviceId);
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setCurrentBiomarkerAssociationId(null);
  };

  const columns: Column<IBiomarkerAssociation>[] = [
    {
      id: 'gene',
      Header: 'Gene',
      Cell({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: IBiomarkerAssociation } };
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
        cell: { row: { original: IBiomarkerAssociation } };
      }): any {
        return <>{original.alterations && getAlterationName(original.alterations)}</>;
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
        cell: { row: { original: IBiomarkerAssociation } };
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
        cell: { row: { original: IBiomarkerAssociation } };
      }): any {
        return <>{original.drugs && getTreatmentName(original.drugs)}</>;
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
        cell: { row: { original: IBiomarkerAssociation } };
      }): any {
        return <>{original.fdaSubmissions && getFdaSubmissionLinks(original.fdaSubmissions)}</>;
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
        cell: { row: { original: IBiomarkerAssociation } };
      }): any {
        return (
          <>
            <Button
              text="Delete"
              color="danger"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setCurrentBiomarkerAssociationId(original.id);
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </>
        );
      },
      width: 50,
    });
  }

  return (
    <>
      <h4>Biomarker Associations</h4>
      <OncoKBTable columns={columns} data={props.biomarkerAssociations} loading={props.loading} />
      <SimpleConfirmModal
        show={showModal}
        onCancel={handleCancel}
        onConfirm={handleDeleteIndication}
        body={'Are you sure you want to delete this association?'}
      />
    </>
  );
};

const mapStoreToProps = ({ biomarkerAssociationStore }: IRootStore) => ({
  deleteEntity: biomarkerAssociationStore.deleteEntity,
  getBiomarkerAssociations: biomarkerAssociationStore.getByCompanionDiagnosticDevice,
  biomarkerAssociations: biomarkerAssociationStore.entities,
  loading: biomarkerAssociationStore.loading,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CdxBiomarkerAssociationTable);
