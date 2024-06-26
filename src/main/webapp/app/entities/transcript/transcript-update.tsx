import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col, Label } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect from 'app/shared/select/GeneSelect';

export interface ITranscriptUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUpdate = (props: ITranscriptUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);
  const [selectedGeneId, setSelectedGeneId] = useState<number>();

  const flags = props.flags;
  const ensemblGenes = props.ensemblGenes;
  const genes = props.genes;
  const transcriptEntity = props.transcriptEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/transcript' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getFlags({});
    props.getEnsemblGenes({});
    props.getGenes({});
    props.getAlterations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  // TYPE-ISSUE: is values supposed to be ITranscript?
  const saveEntity = values => {
    const entity = {
      ...transcriptEntity,
      ...values,
      flags: mapIdList(values.flags),
      ensemblGene: ensemblGenes.find(it => it.id?.toString() === values.ensemblGeneId.toString()),
      gene: genes.find(it => it.id?.toString() === selectedGeneId),
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
          referenceGenome: 'GRCh37',
          ...transcriptEntity,
          flags: transcriptEntity?.flags?.map(e => e.id?.toString()),
          ensemblGeneId: transcriptEntity?.ensemblGene?.id,
          geneId: transcriptEntity?.gene?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.transcript.home.createOrEditLabel" data-cy="TranscriptCreateUpdateHeading">
            Add or edit a Transcript
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="transcript-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Reference Genome"
                id="transcript-referenceGenome"
                name="referenceGenome"
                data-cy="referenceGenome"
                type="select"
              >
                <option value="GRCh37">GRCh37</option>
                <option value="GRCh38">GRCh38</option>
              </ValidatedField>
              <ValidatedField
                label="Ensembl Transcript Id"
                id="transcript-ensemblTranscriptId"
                name="ensemblTranscriptId"
                data-cy="ensemblTranscriptId"
                type="text"
              />
              <ValidatedField label="Canonical" id="transcript-canonical" name="canonical" data-cy="canonical" check type="checkbox" />
              <ValidatedField
                label="Ensembl Protein Id"
                id="transcript-ensemblProteinId"
                name="ensemblProteinId"
                data-cy="ensemblProteinId"
                type="text"
              />
              <ValidatedField
                label="Reference Sequence Id"
                id="transcript-referenceSequenceId"
                name="referenceSequenceId"
                data-cy="referenceSequenceId"
                type="text"
              />
              <ValidatedField label="Description" id="transcript-description" name="description" data-cy="description" type="text" />
              <ValidatedField label="Flag" id="transcript-flag" data-cy="flag" type="select" multiple name="flags">
                <option value="" key="0" />
                {flags
                  ? flags
                      .filter(otherEntity => otherEntity.type === 'TRANSCRIPT')
                      .map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                  : null}
              </ValidatedField>
              <ValidatedField id="transcript-ensemblGene" name="ensemblGeneId" data-cy="ensemblGene" label="Ensembl Gene" type="select">
                <option value="" key="0" />
                {ensemblGenes
                  ? ensemblGenes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Label>Gene</Label>
              <GeneSelect
                isMulti={false}
                onChange={option => {
                  setSelectedGeneId(option?.value);
                }}
                className={'mb-3'}
                defaultValue={
                  props.transcriptEntity?.gene && props.transcriptEntity.gene.id && props.transcriptEntity.gene.hugoSymbol
                    ? {
                        value: props.transcriptEntity.gene.id,
                        label: props.transcriptEntity.gene.hugoSymbol,
                        synonyms: props.transcriptEntity.gene.synonyms ?? [],
                      }
                    : undefined
                }
              />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  flags: storeState.flagStore.entities,
  ensemblGenes: storeState.ensemblGeneStore.entities,
  genes: storeState.geneStore.entities,
  alterations: storeState.alterationStore.entities,
  transcriptEntity: storeState.transcriptStore.entity,
  loading: storeState.transcriptStore.loading,
  updating: storeState.transcriptStore.updating,
  updateSuccess: storeState.transcriptStore.updateSuccess,
  getFlags: storeState.flagStore.getEntities,
  getEnsemblGenes: storeState.ensemblGeneStore.getEntities,
  getGenes: storeState.geneStore.getEntities,
  getAlterations: storeState.alterationStore.getEntities,
  getEntity: storeState.transcriptStore.getEntity,
  updateEntity: storeState.transcriptStore.updateEntity,
  createEntity: storeState.transcriptStore.createEntity,
  reset: storeState.transcriptStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TranscriptUpdate);
