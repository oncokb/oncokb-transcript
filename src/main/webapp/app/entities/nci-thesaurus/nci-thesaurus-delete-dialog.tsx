import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface INciThesaurusDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const NciThesaurusDeleteDialog = (props: INciThesaurusDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const nciThesaurusEntity = props.nciThesaurusEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/nci-thesaurus' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(nciThesaurusEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="nciThesaurusDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.nciThesaurus.delete.question">Are you sure you want to delete this NciThesaurus?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-nciThesaurus" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ nciThesaurusStore }: IRootStore) => ({
  nciThesaurusEntity: nciThesaurusStore.entity,
  updateSuccess: nciThesaurusStore.updateSuccess,
  getEntity: nciThesaurusStore.getEntity,
  deleteEntity: nciThesaurusStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<INciThesaurusDeleteDialogProps, StoreProps>(mapStoreToProps)(NciThesaurusDeleteDialog);
