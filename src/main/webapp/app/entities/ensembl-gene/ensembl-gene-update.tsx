import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IGene } from 'app/shared/model/gene.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IEnsemblGeneUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EnsemblGeneUpdate = (props: IEnsemblGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const genes = props.genes;
  const ensemblGeneEntity = props.ensemblGeneEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/ensembl-gene' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getGenes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...ensemblGeneEntity,
      ...values,
      gene: genes.find(it => it.id.toString() === values.geneId.toString()),
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
          ...ensemblGeneEntity,
          geneId: ensemblGeneEntity?.gene?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.ensemblGene.home.createOrEditLabel" data-cy="EnsemblGeneCreateUpdateHeading">
            Create or edit a EnsemblGene
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="ensembl-gene-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Reference Genome"
                id="ensembl-gene-referenceGenome"
                name="referenceGenome"
                data-cy="referenceGenome"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Ensembl Gene Id"
                id="ensembl-gene-ensemblGeneId"
                name="ensemblGeneId"
                data-cy="ensemblGeneId"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Canonical" id="ensembl-gene-canonical" name="canonical" data-cy="canonical" check type="checkbox" />
              <ValidatedField
                label="Chromosome"
                id="ensembl-gene-chromosome"
                name="chromosome"
                data-cy="chromosome"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Start"
                id="ensembl-gene-start"
                name="start"
                data-cy="start"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="End"
                id="ensembl-gene-end"
                name="end"
                data-cy="end"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Strand"
                id="ensembl-gene-strand"
                name="strand"
                data-cy="strand"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField id="ensembl-gene-gene" name="geneId" data-cy="gene" label="Gene" type="select">
                <option value="" key="0" />
                {genes
                  ? genes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/ensembl-gene" replace color="info">
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
  genes: storeState.geneStore.entities,
  ensemblGeneEntity: storeState.ensemblGeneStore.entity,
  loading: storeState.ensemblGeneStore.loading,
  updating: storeState.ensemblGeneStore.updating,
  updateSuccess: storeState.ensemblGeneStore.updateSuccess,
  getGenes: storeState.geneStore.getEntities,
  getEntity: storeState.ensemblGeneStore.getEntity,
  updateEntity: storeState.ensemblGeneStore.updateEntity,
  createEntity: storeState.ensemblGeneStore.createEntity,
  reset: storeState.ensemblGeneStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGeneUpdate);
