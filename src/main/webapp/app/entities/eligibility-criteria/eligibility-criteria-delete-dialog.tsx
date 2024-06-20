import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IEligibilityCriteriaDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EligibilityCriteriaDeleteDialog = (props: IEligibilityCriteriaDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const eligibilityCriteriaEntity = props.eligibilityCriteriaEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/eligibility-criteria' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(eligibilityCriteriaEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="eligibilityCriteriaDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.eligibilityCriteria.delete.question">
        Are you sure you want to delete this EligibilityCriteria?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-eligibilityCriteria" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ eligibilityCriteriaStore }: IRootStore) => ({
  eligibilityCriteriaEntity: eligibilityCriteriaStore.entity,
  updateSuccess: eligibilityCriteriaStore.updateSuccess,
  getEntity: eligibilityCriteriaStore.getEntity,
  deleteEntity: eligibilityCriteriaStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IEligibilityCriteriaDeleteDialogProps, StoreProps>(mapStoreToProps)(EligibilityCriteriaDeleteDialog);
