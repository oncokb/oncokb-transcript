import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IVariantConsequenceDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const VariantConsequenceDeleteDialog = (props: IVariantConsequenceDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const variantConsequenceEntity = props.variantConsequenceEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/variant-consequence');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(variantConsequenceEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="variantConsequenceDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.variantConsequence.delete.question">
        Are you sure you want to delete this VariantConsequence?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-variantConsequence" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ variantConsequenceStore }: IRootStore) => ({
  variantConsequenceEntity: variantConsequenceStore.entity,
  updateSuccess: variantConsequenceStore.updateSuccess,
  getEntity: variantConsequenceStore.getEntity,
  deleteEntity: variantConsequenceStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(VariantConsequenceDeleteDialog);