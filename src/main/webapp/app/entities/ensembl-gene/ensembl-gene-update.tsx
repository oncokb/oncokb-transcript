import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col, Label } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import GeneSelect from 'app/shared/select/GeneSelect';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface IEnsemblGeneUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EnsemblGeneUpdate = (props: IEnsemblGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);
  const [selectedGeneId, setSelectedGeneId] = useState<number>();

  const seqRegions = props.seqRegions;
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
    props.getSeqRegions({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  // TYPE-ISSUE: don't know values' type
  const saveEntity = values => {
    const entity = {
      ...ensemblGeneEntity,
      ...values,
      gene: {
        id: selectedGeneId,
      },
      seqRegion: seqRegions.find(it => it.id.toString() === values.seqRegionId.toString()),
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
          referenceGenome: ensemblGeneEntity.referenceGenome ?? 'GRCh37',
          geneId: ensemblGeneEntity?.gene?.id,
          seqRegionId: ensemblGeneEntity?.seqRegion?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.ensemblGene.home.createOrEditLabel" data-cy="EnsemblGeneCreateUpdateHeading">
            Add or edit a EnsemblGene
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
                type="select"
              >
                <option value="GRCh37">GRCh37</option>
                <option value="GRCh38">GRCh38</option>
              </ValidatedField>
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
              <Label>Gene</Label>
              <GeneSelect onChange={option => setSelectedGeneId(option?.value)} className={'mb-3'} />
              <ValidatedField id="ensembl-gene-seqRegion" name="seqRegionId" data-cy="seqRegion" label="Seq Region" type="select">
                <option value="" key="0" />
                {seqRegions
                  ? seqRegions.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  genes: storeState.geneStore.entities,
  seqRegions: storeState.seqRegionStore.entities,
  ensemblGeneEntity: storeState.ensemblGeneStore.entity,
  loading: storeState.ensemblGeneStore.loading,
  updating: storeState.ensemblGeneStore.updating,
  updateSuccess: storeState.ensemblGeneStore.updateSuccess,
  getGenes: storeState.geneStore.getEntities,
  getSeqRegions: storeState.seqRegionStore.getEntities,
  getEntity: storeState.ensemblGeneStore.getEntity,
  updateEntity: storeState.ensemblGeneStore.updateEntity,
  createEntity: storeState.ensemblGeneStore.createEntity,
  reset: storeState.ensemblGeneStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGeneUpdate);
