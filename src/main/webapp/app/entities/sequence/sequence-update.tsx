import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ITranscript } from 'app/shared/model/transcript.model';
import { ISequence } from 'app/shared/model/sequence.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface ISequenceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SequenceUpdate = (props: ISequenceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const transcripts = props.transcripts;
  const sequenceEntity = props.sequenceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/sequence' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getTranscripts({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...sequenceEntity,
      ...values,
      transcript: transcripts.find(it => it.id.toString() === values.transcriptId.toString()),
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
          sequenceType: 'PROTEIN',
          ...sequenceEntity,
          transcriptId: sequenceEntity?.transcript?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.sequence.home.createOrEditLabel" data-cy="SequenceCreateUpdateHeading">
            Create or edit a Sequence
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="sequence-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Sequence Type" id="sequence-sequenceType" name="sequenceType" data-cy="sequenceType" type="select">
                <option value="PROTEIN">PROTEIN</option>
                <option value="CDNA">CDNA</option>
              </ValidatedField>
              <ValidatedField label="Sequence" id="sequence-sequence" name="sequence" data-cy="sequence" type="textarea" />
              <ValidatedField id="sequence-transcript" name="transcriptId" data-cy="transcript" label="Transcript" type="select">
                <option value="" key="0" />
                {transcripts
                  ? transcripts.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
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
  transcripts: storeState.transcriptStore.entities,
  sequenceEntity: storeState.sequenceStore.entity,
  loading: storeState.sequenceStore.loading,
  updating: storeState.sequenceStore.updating,
  updateSuccess: storeState.sequenceStore.updateSuccess,
  getTranscripts: storeState.transcriptStore.getEntities,
  getEntity: storeState.sequenceStore.getEntity,
  updateEntity: storeState.sequenceStore.updateEntity,
  createEntity: storeState.sequenceStore.createEntity,
  reset: storeState.sequenceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SequenceUpdate);
