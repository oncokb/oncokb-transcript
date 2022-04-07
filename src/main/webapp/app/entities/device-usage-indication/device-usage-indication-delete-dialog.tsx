import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IDeviceUsageIndicationDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DeviceUsageIndicationDeleteDialog = (props: IDeviceUsageIndicationDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const deviceUsageIndicationEntity = props.deviceUsageIndicationEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/device-usage-indication');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(deviceUsageIndicationEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="deviceUsageIndicationDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.deviceUsageIndication.delete.question">
        Are you sure you want to delete this DeviceUsageIndication?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-deviceUsageIndication" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ deviceUsageIndicationStore }: IRootStore) => ({
  deviceUsageIndicationEntity: deviceUsageIndicationStore.entity,
  updateSuccess: deviceUsageIndicationStore.updateSuccess,
  getEntity: deviceUsageIndicationStore.getEntity,
  deleteEntity: deviceUsageIndicationStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DeviceUsageIndicationDeleteDialog);
