import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';

export interface ISeqRegionDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SeqRegionDeleteDialog = (props: ISeqRegionDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const seqRegionEntity = props.seqRegionEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/seq-region');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(seqRegionEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="seqRegionDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.seqRegion.delete.question">Are you sure you want to delete this SeqRegion?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-seqRegion" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ seqRegionStore }: IRootStore) => ({
  seqRegionEntity: seqRegionStore.entity,
  updateSuccess: seqRegionStore.updateSuccess,
  getEntity: seqRegionStore.getEntity,
  deleteEntity: seqRegionStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<ISeqRegionDeleteDialogProps, StoreProps>(mapStoreToProps)(SeqRegionDeleteDialog);
