import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IGenomicIndicatorDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomicIndicatorDeleteDialog = (props: IGenomicIndicatorDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomicIndicatorEntity = props.genomicIndicatorEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/genomic-indicator');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(genomicIndicatorEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="genomicIndicatorDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.genomicIndicator.delete.question">Are you sure you want to delete this GenomicIndicator?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-genomicIndicator" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ genomicIndicatorStore }: IRootStore) => ({
  genomicIndicatorEntity: genomicIndicatorStore.entity,
  updateSuccess: genomicIndicatorStore.updateSuccess,
  getEntity: genomicIndicatorStore.getEntity,
  deleteEntity: genomicIndicatorStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomicIndicatorDeleteDialog);
