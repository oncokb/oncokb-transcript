import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IDrugSynonymDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugSynonymDeleteDialog = (props: IDrugSynonymDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugSynonymEntity = props.drugSynonymEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-synonym');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(drugSynonymEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="drugSynonymDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.drugSynonym.delete.question">Are you sure you want to delete this DrugSynonym?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-drugSynonym" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ drugSynonymStore }: IRootStore) => ({
  drugSynonymEntity: drugSynonymStore.entity,
  updateSuccess: drugSynonymStore.updateSuccess,
  getEntity: drugSynonymStore.getEntity,
  deleteEntity: drugSynonymStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugSynonymDeleteDialog);
