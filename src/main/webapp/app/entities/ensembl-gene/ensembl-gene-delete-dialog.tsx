import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IEnsemblGeneDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EnsemblGeneDeleteDialog = (props: IEnsemblGeneDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const ensemblGeneEntity = props.ensemblGeneEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/ensembl-gene');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(ensemblGeneEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="ensemblGeneDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.ensemblGene.delete.question">Are you sure you want to delete this EnsemblGene?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-ensemblGene" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  ensemblGeneEntity: ensemblGeneStore.entity,
  updateSuccess: ensemblGeneStore.updateSuccess,
  getEntity: ensemblGeneStore.getEntity,
  deleteEntity: ensemblGeneStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGeneDeleteDialog);
