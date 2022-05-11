import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

export interface IGeneUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneUpdate = (props: IGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const geneEntity = props.geneEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/gene' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...geneEntity,
      ...values,
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...geneEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.gene.home.createOrEditLabel" data-cy="GeneCreateUpdateHeading">
            Create or edit a Gene
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="gene-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Entrez Gene Id" id="gene-entrezGeneId" name="entrezGeneId" data-cy="entrezGeneId" type="text" />
              <ValidatedField label="Hugo Symbol" id="gene-hugoSymbol" name="hugoSymbol" data-cy="hugoSymbol" type="text" />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/gene" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  geneEntity: storeState.geneStore.entity,
  loading: storeState.geneStore.loading,
  updating: storeState.geneStore.updating,
  updateSuccess: storeState.geneStore.updateSuccess,
  getEntity: storeState.geneStore.getEntity,
  updateEntity: storeState.geneStore.updateEntity,
  createEntity: storeState.geneStore.createEntity,
  reset: storeState.geneStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneUpdate);
