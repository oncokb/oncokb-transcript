import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface ICategoricalAlterationDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CategoricalAlterationDeleteDialog = (props: ICategoricalAlterationDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const categoricalAlterationEntity = props.categoricalAlterationEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/categorical-alteration');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(categoricalAlterationEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="categoricalAlterationDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.categoricalAlteration.delete.question">
        Are you sure you want to delete this CategoricalAlteration?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-categoricalAlteration" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ categoricalAlterationStore }: IRootStore) => ({
  categoricalAlterationEntity: categoricalAlterationStore.entity,
  updateSuccess: categoricalAlterationStore.updateSuccess,
  getEntity: categoricalAlterationStore.getEntity,
  deleteEntity: categoricalAlterationStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlterationDeleteDialog);
