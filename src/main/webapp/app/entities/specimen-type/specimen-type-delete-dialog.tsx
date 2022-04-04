import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface ISpecimenTypeDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SpecimenTypeDeleteDialog = (props: ISpecimenTypeDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const specimenTypeEntity = props.specimenTypeEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/specimen-type');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(specimenTypeEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="specimenTypeDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.specimenType.delete.question">Are you sure you want to delete this SpecimenType?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-specimenType" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ specimenTypeStore }: IRootStore) => ({
  specimenTypeEntity: specimenTypeStore.entity,
  updateSuccess: specimenTypeStore.updateSuccess,
  getEntity: specimenTypeStore.getEntity,
  deleteEntity: specimenTypeStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SpecimenTypeDeleteDialog);
