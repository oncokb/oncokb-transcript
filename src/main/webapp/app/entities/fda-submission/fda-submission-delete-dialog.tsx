import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IFdaSubmissionDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionDeleteDialog = (props: IFdaSubmissionDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaSubmissionEntity = props.fdaSubmissionEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-submission' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(fdaSubmissionEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="fdaSubmissionDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.fdaSubmission.delete.question">Are you sure you want to delete this FdaSubmission?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-fdaSubmission" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionEntity: fdaSubmissionStore.entity,
  updateSuccess: fdaSubmissionStore.updateSuccess,
  getEntity: fdaSubmissionStore.getEntity,
  deleteEntity: fdaSubmissionStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionDeleteDialog);
