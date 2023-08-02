import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IBiomarkerAssociationDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const BiomarkerAssociationDeleteDialog = (props: IBiomarkerAssociationDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const biomarkerAssociationEntity = props.biomarkerAssociationEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/biomarker-association');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(biomarkerAssociationEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="biomarkerAssociationDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.biomarkerAssociation.delete.question">
        Are you sure you want to delete this BiomarkerAssociation?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-biomarkerAssociation" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ biomarkerAssociationStore }: IRootStore) => ({
  biomarkerAssociationEntity: biomarkerAssociationStore.entity,
  updateSuccess: biomarkerAssociationStore.updateSuccess,
  getEntity: biomarkerAssociationStore.getEntity,
  deleteEntity: biomarkerAssociationStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(BiomarkerAssociationDeleteDialog);
