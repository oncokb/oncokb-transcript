import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IConsequenceDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ConsequenceDeleteDialog = (props: IConsequenceDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const consequenceEntity = props.consequenceEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/consequence');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(consequenceEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="consequenceDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.consequence.delete.question">Are you sure you want to delete this Consequence?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-consequence" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ consequenceStore }: IRootStore) => ({
  consequenceEntity: consequenceStore.entity,
  updateSuccess: consequenceStore.updateSuccess,
  getEntity: consequenceStore.getEntity,
  deleteEntity: consequenceStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ConsequenceDeleteDialog);
