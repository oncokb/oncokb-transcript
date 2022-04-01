import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IGenomeFragmentDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomeFragmentDeleteDialog = (props: IGenomeFragmentDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomeFragmentEntity = props.genomeFragmentEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/genome-fragment');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(genomeFragmentEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="genomeFragmentDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.genomeFragment.delete.question">Are you sure you want to delete this GenomeFragment?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-genomeFragment" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ genomeFragmentStore }: IRootStore) => ({
  genomeFragmentEntity: genomeFragmentStore.entity,
  updateSuccess: genomeFragmentStore.updateSuccess,
  getEntity: genomeFragmentStore.getEntity,
  deleteEntity: genomeFragmentStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomeFragmentDeleteDialog);
