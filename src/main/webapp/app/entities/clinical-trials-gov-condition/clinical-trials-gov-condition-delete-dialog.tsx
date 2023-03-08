import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IClinicalTrialsGovConditionDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialsGovConditionDeleteDialog = (props: IClinicalTrialsGovConditionDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const clinicalTrialsGovConditionEntity = props.clinicalTrialsGovConditionEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/clinical-trials-gov-condition' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(clinicalTrialsGovConditionEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="clinicalTrialsGovConditionDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.clinicalTrialsGovCondition.delete.question">
        Are you sure you want to delete this condition?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button
          id="jhi-confirm-delete-clinicalTrialsGovCondition"
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

const mapStoreToProps = ({ clinicalTrialsGovConditionStore }: IRootStore) => ({
  clinicalTrialsGovConditionEntity: clinicalTrialsGovConditionStore.entity,
  updateSuccess: clinicalTrialsGovConditionStore.updateSuccess,
  getEntity: clinicalTrialsGovConditionStore.getEntity,
  deleteEntity: clinicalTrialsGovConditionStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialsGovConditionDeleteDialog);
