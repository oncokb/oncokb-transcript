import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IAssociationCancerTypeDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AssociationCancerTypeDeleteDialog = (props: IAssociationCancerTypeDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const associationCancerTypeEntity = props.associationCancerTypeEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/association-cancer-type');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(associationCancerTypeEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="associationCancerTypeDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.associationCancerType.delete.question">
        Are you sure you want to delete this AssociationCancerType?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-associationCancerType" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ associationCancerTypeStore }: IRootStore) => ({
  associationCancerTypeEntity: associationCancerTypeStore.entity,
  updateSuccess: associationCancerTypeStore.updateSuccess,
  getEntity: associationCancerTypeStore.getEntity,
  deleteEntity: associationCancerTypeStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationCancerTypeDeleteDialog);
