import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IFdaDrugDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaDrugDeleteDialog = (props: IFdaDrugDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaDrugEntity = props.fdaDrugEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-drug' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(fdaDrugEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="fdaDrugDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.fdaDrug.delete.question">Are you sure you want to delete this FdaDrug?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-fdaDrug" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ fdaDrugStore }: IRootStore) => ({
  fdaDrugEntity: fdaDrugStore.entity,
  updateSuccess: fdaDrugStore.updateSuccess,
  getEntity: fdaDrugStore.getEntity,
  deleteEntity: fdaDrugStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaDrugDeleteDialog);
