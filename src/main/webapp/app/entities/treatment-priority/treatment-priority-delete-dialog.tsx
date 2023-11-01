import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface ITreatmentPriorityDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentPriorityDeleteDialog = (props: ITreatmentPriorityDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const treatmentPriorityEntity = props.treatmentPriorityEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/treatment-priority');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(treatmentPriorityEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="treatmentPriorityDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.treatmentPriority.delete.question">
        Are you sure you want to delete this TreatmentPriority?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-treatmentPriority" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ treatmentPriorityStore }: IRootStore) => ({
  treatmentPriorityEntity: treatmentPriorityStore.entity,
  updateSuccess: treatmentPriorityStore.updateSuccess,
  getEntity: treatmentPriorityStore.getEntity,
  deleteEntity: treatmentPriorityStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentPriorityDeleteDialog);
