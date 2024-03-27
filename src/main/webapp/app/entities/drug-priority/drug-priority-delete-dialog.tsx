import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IDrugPriorityDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugPriorityDeleteDialog = (props: IDrugPriorityDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugPriorityEntity = props.drugPriorityEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-priority');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(drugPriorityEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="drugPriorityDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.drugPriority.delete.question">Are you sure you want to delete this DrugPriority?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-drugPriority" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ drugPriorityStore }: IRootStore) => ({
  drugPriorityEntity: drugPriorityStore.entity,
  updateSuccess: drugPriorityStore.updateSuccess,
  getEntity: drugPriorityStore.getEntity,
  deleteEntity: drugPriorityStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugPriorityDeleteDialog);
