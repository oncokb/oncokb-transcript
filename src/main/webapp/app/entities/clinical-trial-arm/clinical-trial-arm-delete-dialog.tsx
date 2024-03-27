import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IClinicalTrialArmDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialArmDeleteDialog = (props: IClinicalTrialArmDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const clinicalTrialArmEntity = props.clinicalTrialArmEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/clinical-trial-arm' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(clinicalTrialArmEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="clinicalTrialArmDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.clinicalTrialArm.delete.question">Are you sure you want to delete this ClinicalTrialArm?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-clinicalTrialArm" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ clinicalTrialArmStore }: IRootStore) => ({
  clinicalTrialArmEntity: clinicalTrialArmStore.entity,
  updateSuccess: clinicalTrialArmStore.updateSuccess,
  getEntity: clinicalTrialArmStore.getEntity,
  deleteEntity: clinicalTrialArmStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialArmDeleteDialog);
