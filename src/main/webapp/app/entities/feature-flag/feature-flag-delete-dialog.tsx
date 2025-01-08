import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

export interface IFeatureFlagDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FeatureFlagDeleteDialog = (props: IFeatureFlagDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const featureFlagEntity = props.featureFlagEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/feature-flag' + props.location.search);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(featureFlagEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="featureFlagDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbCurationApp.featureFlag.delete.question">Are you sure you want to delete this FeatureFlag?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-featureFlag" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ featureFlagStore }: IRootStore) => ({
  featureFlagEntity: featureFlagStore.entity,
  updateSuccess: featureFlagStore.updateSuccess,
  getEntity: featureFlagStore.getEntity,
  deleteEntity: featureFlagStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FeatureFlagDeleteDialog);
