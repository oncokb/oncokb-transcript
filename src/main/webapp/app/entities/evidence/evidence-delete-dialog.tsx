import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IEvidenceDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EvidenceDeleteDialog = (props: IEvidenceDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const evidenceEntity = props.evidenceEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/evidence' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(evidenceEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="evidenceDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.evidence.delete.question">Are you sure you want to delete this Evidence?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-evidence" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ evidenceStore }: IRootStore) => ({
  evidenceEntity: evidenceStore.entity,
  updateSuccess: evidenceStore.updateSuccess,
  getEntity: evidenceStore.getEntity,
  deleteEntity: evidenceStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IEvidenceDeleteDialogProps, StoreProps>(mapStoreToProps)(EvidenceDeleteDialog);
