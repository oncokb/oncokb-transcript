import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { ITranscript } from 'app/shared/model/transcript.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITranscriptUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUpdate = (props: ITranscriptUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const ensemblGenes = props.ensemblGenes;
  const transcriptEntity = props.transcriptEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/transcript');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getEnsemblGenes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...transcriptEntity,
      ...values,
      ensemblGene: ensemblGenes.find(it => it.id.toString() === values.ensemblGeneId.toString()),
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
          ensemblGeneId: transcriptEntity?.ensemblGene?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.transcript.home.createOrEditLabel" data-cy="TranscriptCreateUpdateHeading">
            Create or edit a Transcript
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/transcript" replace color="info">
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
  ensemblGenes: storeState.ensemblGeneStore.entities,
  transcriptEntity: storeState.transcriptStore.entity,
  loading: storeState.transcriptStore.loading,
  updating: storeState.transcriptStore.updating,
  updateSuccess: storeState.transcriptStore.updateSuccess,
  getEnsemblGenes: storeState.ensemblGeneStore.getEntities,
  getEntity: storeState.transcriptStore.getEntity,
  updateEntity: storeState.transcriptStore.updateEntity,
  createEntity: storeState.transcriptStore.createEntity,
  reset: storeState.transcriptStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TranscriptUpdate);
