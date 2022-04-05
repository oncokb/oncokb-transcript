import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IInfoDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const InfoDeleteDialog = (props: IInfoDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const infoEntity = props.infoEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/info');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(infoEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="infoDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.info.delete.question">Are you sure you want to delete this Info?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-info" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ infoStore }: IRootStore) => ({
  infoEntity: infoStore.entity,
  updateSuccess: infoStore.updateSuccess,
  getEntity: infoStore.getEntity,
  deleteEntity: infoStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(InfoDeleteDialog);
