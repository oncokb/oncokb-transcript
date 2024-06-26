import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface ILevelOfEvidenceDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const LevelOfEvidenceDeleteDialog = (props: ILevelOfEvidenceDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const levelOfEvidenceEntity = props.levelOfEvidenceEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/level-of-evidence');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(levelOfEvidenceEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="levelOfEvidenceDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.levelOfEvidence.delete.question">Are you sure you want to delete this LevelOfEvidence?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-levelOfEvidence" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ levelOfEvidenceStore }: IRootStore) => ({
  levelOfEvidenceEntity: levelOfEvidenceStore.entity,
  updateSuccess: levelOfEvidenceStore.updateSuccess,
  getEntity: levelOfEvidenceStore.getEntity,
  deleteEntity: levelOfEvidenceStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(LevelOfEvidenceDeleteDialog);
