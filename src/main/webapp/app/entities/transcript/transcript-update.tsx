import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col, Label } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect, { GeneSelectOption } from 'app/shared/select/GeneSelect';
import EnsemblGeneSelect, { EnsemblGeneSelectOption, getEnsemblGeneSelectLabel } from 'app/shared/select/EnsemblGeneSelect';

export interface ITranscriptUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUpdate = (props: ITranscriptUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);
  const [geneValue, setGeneValue] = useState<GeneSelectOption | null>(null);
  const [ensemblGeneValue, setEnsemblGeneValue] = useState<EnsemblGeneSelectOption | null>(null);

  const flags = props.flags;
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
    props.getAlterations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (transcriptEntity?.gene) {
      setGeneValue({
        value: transcriptEntity.gene.id,
        label: transcriptEntity.gene.hugoSymbol,
        synonyms: transcriptEntity.gene.synonyms ?? [],
      });
    }
    if (transcriptEntity?.ensemblGene) {
      setEnsemblGeneValue({
        value: transcriptEntity.ensemblGene.id,
        label: getEnsemblGeneSelectLabel(transcriptEntity.ensemblGene),
      });
    }
  }, [transcriptEntity]);

  // TYPE-ISSUE: is values supposed to be ITranscript?
  // The call setSelectedGeneId is setting as a number
  // onChange={option => { setSelectedGeneId(option?.value); }}
  const saveEntity = values => {
    const entity = {
      ...transcriptEntity,
      ...values,
      flags: mapIdList(values.flags),
      ensemblGene: ensemblGeneValue ? { id: ensemblGeneValue.value } : undefined,
      gene: geneValue ? { id: geneValue.value } : undefined,
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
          ...transcriptEntity,
          referenceGenome: transcriptEntity.referenceGenome ?? 'GRCh37',
          flags: transcriptEntity?.flags?.map(e => e.id.toString()),
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
              <Label>Ensembl Gene</Label>
              <EnsemblGeneSelect onChange={setEnsemblGeneValue} className="mb-3" value={ensemblGeneValue} />
              <Label>Gene</Label>
              <GeneSelect onChange={setGeneValue} className={'mb-3'} value={geneValue} />
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
  alterations: storeState.alterationStore.entities,
  transcriptEntity: storeState.transcriptStore.entity,
  loading: storeState.transcriptStore.loading,
  updating: storeState.transcriptStore.updating,
  updateSuccess: storeState.transcriptStore.updateSuccess,
  getFlags: storeState.flagStore.getEntities,
  getAlterations: storeState.alterationStore.getEntities,
  getEntity: storeState.transcriptStore.getEntity,
  updateEntity: storeState.transcriptStore.updateEntity,
  createEntity: storeState.transcriptStore.createEntity,
  reset: storeState.transcriptStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TranscriptUpdate);
