import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IAlterationReferenceGenomeDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationReferenceGenomeDeleteDialog = (props: IAlterationReferenceGenomeDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const alterationReferenceGenomeEntity = props.alterationReferenceGenomeEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/alteration-reference-genome');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(alterationReferenceGenomeEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="alterationReferenceGenomeDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.alterationReferenceGenome.delete.question">
        Are you sure you want to delete this AlterationReferenceGenome?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-alterationReferenceGenome"
          data-cy="entityConfirmDeleteButton"
          color="danger"
          onClick={confirmDelete}
        >
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ alterationReferenceGenomeStore }: IRootStore) => ({
  alterationReferenceGenomeEntity: alterationReferenceGenomeStore.entity,
  updateSuccess: alterationReferenceGenomeStore.updateSuccess,
  getEntity: alterationReferenceGenomeStore.getEntity,
  deleteEntity: alterationReferenceGenomeStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationReferenceGenomeDeleteDialog);
