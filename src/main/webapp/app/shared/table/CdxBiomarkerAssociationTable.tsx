import React, { useEffect, useMemo, useState } from 'react';
import { connect } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { IAssociation } from '../model/association.model';
import { Column } from 'react-table';
import { getAlterationName, getCancerTypeName, getGeneNamesStringFromAlterations, getTreatmentName } from '../util/utils';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SimpleConfirmModal } from '../modal/SimpleConfirmModal';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OncoKBTable from './OncoKBTable';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import _ from 'lodash';

interface CdxBiomarkerAssociationTableProps extends StoreProps {
  editable?: boolean;
  fdaSubmissions: IFdaSubmission[];
  onDeleteBiomarkerAssociation?: () => void;
}

export const CdxBiomarkerAssociationTable: React.FunctionComponent<CdxBiomarkerAssociationTableProps> = props => {
  const [showModal, setShowModal] = useState(false);
  const [currentBiomarkerAssociationId, setCurrentBiomarkerAssociationId] = useState<number | null>(null);

  const handleDeleteIndication = () => {
    setShowModal(false);
    if (currentBiomarkerAssociationId) {
      props.deleteEntity(currentBiomarkerAssociationId).then(() => {
        props.onDeleteBiomarkerAssociation?.();
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setCurrentBiomarkerAssociationId(null);
  };

  const biomarkerAssociations: IAssociation[] = useMemo(() => {
    const associations: { [key: number]: IAssociation } = {};
    (props.fdaSubmissions || []).forEach(fdaSubmission => {
      fdaSubmission.associations?.forEach(association => {
        const assCopy = _.cloneDeep(association);
        if (assCopy.id !== undefined) {
          const assExists = assCopy.id in associations;
          if (!assExists) {
            if (assCopy.fdaSubmissions === undefined) {
              assCopy.fdaSubmissions = [];
            }
            associations[assCopy.id] = assCopy;
          }
          associations[assCopy.id].fdaSubmissions?.push(fdaSubmission);
        }
      });
    });
    return Object.values(associations);
  }, [props.fdaSubmissions]);

  const columns: Column<IAssociation>[] = [
    {
      id: 'gene',
      Header: 'Gene',
      Cell(cell: { original: IAssociation }) {
        return <div>{getGeneNamesStringFromAlterations(cell.original.alterations || [])}</div>;
      },
    },
    {
      id: 'alterations',
      Header: 'Alterations',
      Cell(cell: { original: IAssociation }) {
        return <>{cell.original.alterations && getAlterationName(cell.original.alterations)}</>;
      },
    },
    {
      id: 'cancerType',
      Header: 'Cancer Type',
      Cell(cell: { original: IAssociation }) {
        return <div>{cell.original.cancerTypes?.map(ct => getCancerTypeName(ct)).join(', ')}</div>;
      },
    },
    {
      id: 'drugs',
      Header: 'Drug',
      Cell(cell: { original: IAssociation }) {
        return (
          <>
            {cell.original.drugs && getTreatmentName(cell.original.drugs, cell.original.rules?.filter(rule => (rule.entity = 'DRUG'))[0])}
          </>
        );
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      Cell(cell: { original: IAssociation }) {
        return <>{cell.original.fdaSubmissions && getFdaSubmissionLinks(cell.original.fdaSubmissions)}</>;
      },
    },
  ];

  if (props.editable) {
    columns.push({
      id: 'remove',
      Header: 'Remove',
      Cell(cell: { original: IAssociation }) {
        return (
          <>
            <Button
              text="Delete"
              color="danger"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setCurrentBiomarkerAssociationId(cell.original.id ?? null);
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </>
        );
      },
      minWidth: 50,
    });
  }

  return (
    <>
      <h4>Biomarker Associations</h4>
      <OncoKBTable data={biomarkerAssociations} columns={columns} showPagination defaultPageSize={5} />
      <SimpleConfirmModal
        show={showModal}
        onCancel={handleCancel}
        onConfirm={handleDeleteIndication}
        body={'Are you sure you want to delete this association?'}
      />
    </>
  );
};

const mapStoreToProps = ({ associationStore }: IRootStore) => ({
  deleteEntity: associationStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<CdxBiomarkerAssociationTableProps, StoreProps>(mapStoreToProps)(CdxBiomarkerAssociationTable);
