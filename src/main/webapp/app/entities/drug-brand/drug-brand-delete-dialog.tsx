import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IDrugBrandDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugBrandDeleteDialog = (props: IDrugBrandDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugBrandEntity = props.drugBrandEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-brand');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(drugBrandEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="drugBrandDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.drugBrand.delete.question">Are you sure you want to delete this DrugBrand?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-drugBrand" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ drugBrandStore }: IRootStore) => ({
  drugBrandEntity: drugBrandStore.entity,
  updateSuccess: drugBrandStore.updateSuccess,
  getEntity: drugBrandStore.getEntity,
  deleteEntity: drugBrandStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugBrandDeleteDialog);
