import React, { useEffect, useState } from 'react';
import { connect } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { IBiomarkerAssociation } from '../model/biomarker-association.model';
import { Column } from 'react-table';
import { getAlterationName, getCancerTypeName, getTreatmentName } from '../util/utils';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SimpleConfirmModal } from '../modal/SimpleConfirmModal';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OncoKBTable from './OncoKBTable';

interface CdxBiomarkerAssociationTableProps extends StoreProps {
  editable?: boolean;
  biomarkerAssociations: IBiomarkerAssociation[];
  onDeleteBiomarkerAssociation: () => void;
}

export const CdxBiomarkerAssociationTable: React.FunctionComponent<CdxBiomarkerAssociationTableProps> = props => {
  const [showModal, setShowModal] = useState(false);
  const [currentBiomarkerAssociationId, setCurrentBiomarkerAssociationId] = useState(null);

  const handleDeleteIndication = () => {
    setShowModal(false);
    if (currentBiomarkerAssociationId) {
      props.deleteEntity(currentBiomarkerAssociationId).then(() => {
        props.onDeleteBiomarkerAssociation();
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
      Cell(cell: { original: IBiomarkerAssociation }) {
        return <div>{cell.original.gene?.hugoSymbol}</div>;
      },
    },
    {
      id: 'alterations',
      Header: 'Alterations',
      Cell(cell: { original: IBiomarkerAssociation }) {
        return <>{cell.original.alterations && getAlterationName(cell.original.alterations)}</>;
      },
    },
    {
      id: 'cancerType',
      Header: 'Cancer Type',
      Cell(cell: { original: IBiomarkerAssociation }) {
        return <div>{getCancerTypeName(cell.original.cancerType)}</div>;
      },
    },
    {
      id: 'drugs',
      Header: 'Drug',
      Cell(cell: { original: IBiomarkerAssociation }) {
        return <>{cell.original.drugs && getTreatmentName(cell.original.drugs)}</>;
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      Cell(cell: { original: IBiomarkerAssociation }) {
        return <>{cell.original.fdaSubmissions && getFdaSubmissionLinks(cell.original.fdaSubmissions)}</>;
      },
    },
  ];

  if (props.editable) {
    columns.push({
      id: 'remove',
      Header: 'Remove',
      Cell(cell: { original: IBiomarkerAssociation }) {
        return (
          <>
            <Button
              text="Delete"
              color="danger"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setCurrentBiomarkerAssociationId(cell.original.id);
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
      <OncoKBTable data={props.biomarkerAssociations.concat()} columns={columns} showPagination />
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
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CdxBiomarkerAssociationTable);
