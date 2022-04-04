import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IFdaSubmissionTypeDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionTypeDeleteDialog = (props: IFdaSubmissionTypeDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaSubmissionTypeEntity = props.fdaSubmissionTypeEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-submission-type');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(fdaSubmissionTypeEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="fdaSubmissionTypeDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.fdaSubmissionType.delete.question">
        Are you sure you want to delete this FdaSubmissionType?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-fdaSubmissionType" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ fdaSubmissionTypeStore }: IRootStore) => ({
  fdaSubmissionTypeEntity: fdaSubmissionTypeStore.entity,
  updateSuccess: fdaSubmissionTypeStore.updateSuccess,
  getEntity: fdaSubmissionTypeStore.getEntity,
  deleteEntity: fdaSubmissionTypeStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionTypeDeleteDialog);
