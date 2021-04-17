import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { setFileData, byteSize, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { ITranscript } from 'app/shared/model/transcript.model';
import { getEntities as getTranscripts } from 'app/entities/transcript/transcript.reducer';
import { getEntity, updateEntity, createEntity, setBlob, reset } from './sequence.reducer';
import { ISequence } from 'app/shared/model/sequence.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ISequenceUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const SequenceUpdate = (props: ISequenceUpdateProps) => {
  const [transcriptId, setTranscriptId] = useState('0');
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { sequenceEntity, transcripts, loading, updating } = props;

  const { sequence } = sequenceEntity;

  const handleClose = () => {
    props.history.push('/sequence');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getTranscripts();
  }, []);

  const onBlobChange = (isAnImage, name) => event => {
    setFileData(event, (contentType, data) => props.setBlob(name, data, contentType), isAnImage);
  };

  const clearBlob = name => () => {
    props.setBlob(name, undefined, undefined);
  };

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...sequenceEntity,
        ...values,
      };

      if (isNew) {
        props.createEntity(entity);
      } else {
        props.updateEntity(entity);
      }
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.sequence.home.createOrEditLabel" data-cy="SequenceCreateUpdateHeading">
            Create or edit a Sequence
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : sequenceEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="sequence-id">ID</Label>
                  <AvInput id="sequence-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="sequenceTypeLabel" for="sequence-sequenceType">
                  Sequence Type
                </Label>
                <AvInput
                  id="sequence-sequenceType"
                  data-cy="sequenceType"
                  type="select"
                  className="form-control"
                  name="sequenceType"
                  value={(!isNew && sequenceEntity.sequenceType) || 'PROTEIN'}
                >
                  <option value="PROTEIN">PROTEIN</option>
                  <option value="CDNA">CDNA</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="sequenceLabel" for="sequence-sequence">
                  Sequence
                </Label>
                <AvInput id="sequence-sequence" data-cy="sequence" type="textarea" name="sequence" />
              </AvGroup>
              <AvGroup>
                <Label for="sequence-transcript">Transcript</Label>
                <AvInput id="sequence-transcript" data-cy="transcript" type="select" className="form-control" name="transcript.id">
                  <option value="" key="0" />
                  {transcripts
                    ? transcripts.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/sequence" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  transcripts: storeState.transcript.entities,
  sequenceEntity: storeState.sequence.entity,
  loading: storeState.sequence.loading,
  updating: storeState.sequence.updating,
  updateSuccess: storeState.sequence.updateSuccess,
});

const mapDispatchToProps = {
  getTranscripts,
  getEntity,
  updateEntity,
  setBlob,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(SequenceUpdate);
