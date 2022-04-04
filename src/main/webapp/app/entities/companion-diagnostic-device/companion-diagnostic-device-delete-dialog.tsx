import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface ICompanionDiagnosticDeviceDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CompanionDiagnosticDeviceDeleteDialog = (props: ICompanionDiagnosticDeviceDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const companionDiagnosticDeviceEntity = props.companionDiagnosticDeviceEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/companion-diagnostic-device');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(companionDiagnosticDeviceEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="companionDiagnosticDeviceDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.companionDiagnosticDevice.delete.question">
        Are you sure you want to delete this CompanionDiagnosticDevice?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-companionDiagnosticDevice"
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

const mapStoreToProps = ({ companionDiagnosticDeviceStore }: IRootStore) => ({
  companionDiagnosticDeviceEntity: companionDiagnosticDeviceStore.entity,
  updateSuccess: companionDiagnosticDeviceStore.updateSuccess,
  getEntity: companionDiagnosticDeviceStore.getEntity,
  deleteEntity: companionDiagnosticDeviceStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDeviceDeleteDialog);
