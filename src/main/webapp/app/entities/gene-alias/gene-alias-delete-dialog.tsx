import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
export interface IGeneAliasDeleteDialogProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneAliasDeleteDialog = (props: IGeneAliasDeleteDialogProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const geneAliasEntity = props.geneAliasEntity;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/gene-alias');
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    props.deleteEntity(geneAliasEntity.id);
  };

  return (
    <Modal isOpen toggle={handleClose}>
      <ModalHeader toggle={handleClose} data-cy="geneAliasDeleteDialogHeading">
        Confirm delete operation
      </ModalHeader>
      <ModalBody id="oncokbTranscriptApp.geneAlias.delete.question">Are you sure you want to delete this GeneAlias?</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          <FontAwesomeIcon icon="ban" />
          &nbsp; Cancel
        </Button>
        <Button id="jhi-confirm-delete-geneAlias" data-cy="entityConfirmDeleteButton" color="danger" onClick={confirmDelete}>
          <FontAwesomeIcon icon="trash" />
          &nbsp; Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStoreToProps = ({ geneAliasStore }: IRootStore) => ({
  geneAliasEntity: geneAliasStore.entity,
  updateSuccess: geneAliasStore.updateSuccess,
  getEntity: geneAliasStore.getEntity,
  deleteEntity: geneAliasStore.deleteEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneAliasDeleteDialog);
