import React, { useMemo, useState } from 'react';
import { connect } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import { getFdaSubmissionLinks } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { IAssociation } from '../model/association.model';
import { filterByKeyword, getAlterationName, getCancerTypeName, getGeneNamesStringFromAlterations, getTreatmentName } from '../util/utils';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { SimpleConfirmModal } from '../modal/SimpleConfirmModal';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OncoKBTable, { FilterableColumn } from './OncoKBTable';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import _ from 'lodash';
import { getGeneFilterValue } from '../util/table-filter-utils';
import { FilterTypes } from './filters/types';

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

  const handleEditIndication = (association: IAssociation) => {
    props.setEditingAssociation(association);
  };

  const biomarkerAssociations: IAssociation[] = useMemo(() => {
    const associations: { [key: number]: IAssociation } = {};
    (props.fdaSubmissions || []).forEach(fdaSubmission => {
      fdaSubmission.associations?.forEach(association => {
        const assCopy = _.cloneDeep(association);
        const assExists = assCopy.id in associations;
        if (!assExists) {
          if (assCopy.fdaSubmissions === undefined) {
            assCopy.fdaSubmissions = [];
          }
          associations[assCopy.id] = assCopy;
        }
        associations[assCopy.id].fdaSubmissions?.push(fdaSubmission);
      });
    });
    return Object.values(associations);
  }, [props.fdaSubmissions]);

  const columns: FilterableColumn<IAssociation>[] = [
    {
      id: 'gene',
      Header: 'Gene',
      Cell(cell: { original: IAssociation }) {
        return <div>{getGeneNamesStringFromAlterations(cell.original.alterations || [])}</div>;
      },
      filterType: FilterTypes.STRING,
      getColumnFilterValue: getGeneFilterValue,
      onSearchFilter(data: IAssociation, keyword) {
        return filterByKeyword(getGeneFilterValue(data), keyword);
      },
    },
    {
      id: 'alterations',
      Header: 'Alterations',
      Cell(cell: { original: IAssociation }) {
        return <>{cell.original.alterations && getAlterationName(cell.original.alterations)}</>;
      },
      disableHeaderFiltering: true,
      onSearchFilter(data: IAssociation, keyword) {
        const altName = getAlterationName(data.alterations ?? []);
        return altName ? filterByKeyword(altName, keyword) : false;
      },
    },
    {
      id: 'cancerType',
      Header: 'Cancer Type',
      Cell(cell: { original: IAssociation }) {
        return <div>{cell.original.cancerTypes?.map(ct => getCancerTypeName(ct)).join(', ')}</div>;
      },
      filterType: FilterTypes.STRING,
      getColumnFilterValue(data: IAssociation) {
        return data.cancerTypes?.map(ct => getCancerTypeName(ct)).join(', ') ?? '';
      },
      onSearchFilter(data: IAssociation, keyword) {
        const ctName = data.cancerTypes?.map(ct => getCancerTypeName(ct)).join(', ') ?? '';
        return ctName ? filterByKeyword(ctName, keyword) : false;
      },
    },
    {
      id: 'drugs',
      Header: 'Drugs',
      Cell(cell: { original: IAssociation }) {
        return (
          <>
            {cell.original.drugs && getTreatmentName(cell.original.drugs, cell.original.rules?.filter(rule => rule.entity === 'DRUG')[0])}
          </>
        );
      },
      getColumnFilterValue(data: IAssociation) {
        if (!data.drugs) {
          return '';
        }
        return getTreatmentName(data.drugs, data.rules?.filter(rule => rule.entity === 'DRUG')[0]);
      },
      filterType: FilterTypes.STRING,
      onSearchFilter(data: IAssociation, keyword) {
        if (!data.drugs) return false;
        const txName = getTreatmentName(data.drugs, data.rules?.filter(rule => rule.entity === 'DRUG')[0]);
        return txName ? filterByKeyword(txName, keyword) : false;
      },
    },
    {
      id: 'fdaSubmissions',
      Header: 'FDA Submissions',
      Cell(cell: { original: IAssociation }) {
        return <>{cell.original.fdaSubmissions && getFdaSubmissionLinks(cell.original.fdaSubmissions)}</>;
      },
      filterType: FilterTypes.STRING,
      getColumnFilterValue(data: IAssociation) {
        if (!data.fdaSubmissions) {
          return '';
        }
        return getFdaSubmissionLinks(data.fdaSubmissions, false) as string;
      },
    },
  ];

  if (props.editable) {
    columns.push({
      id: 'actions',
      Header: 'Actions',
      Cell(cell: { original: IAssociation }) {
        return (
          <div className="d-flex gap-1">
            <Button color="primary" size="sm" onClick={() => handleEditIndication(cell.original)}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setCurrentBiomarkerAssociationId(cell.original.id);
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </div>
        );
      },
      minWidth: 50,
      disableHeaderFiltering: true,
    });
  }

  return (
    <>
      <h4>Biomarker Associations</h4>
      <OncoKBTable
        data={biomarkerAssociations}
        columns={columns}
        showPagination
        defaultPageSize={biomarkerAssociations.length > 5 ? 10 : 5}
      />
      <SimpleConfirmModal
        show={showModal}
        onCancel={handleCancel}
        onConfirm={handleDeleteIndication}
        body={'Are you sure you want to delete this association?'}
      />
    </>
  );
};

const mapStoreToProps = ({ associationStore, cdxAssociationEditStore }: IRootStore) => ({
  deleteEntity: associationStore.deleteEntity,
  setEditingAssociation: cdxAssociationEditStore.setEditingAssociation,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CdxBiomarkerAssociationTable);
