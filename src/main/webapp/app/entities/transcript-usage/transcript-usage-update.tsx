import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { ITranscript } from 'app/shared/model/transcript.model';
import { getEntities as getTranscripts } from 'app/entities/transcript/transcript.reducer';
import { getEntity, updateEntity, createEntity, reset } from './transcript-usage.reducer';
import { ITranscriptUsage } from 'app/shared/model/transcript-usage.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITranscriptUsageUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUsageUpdate = (props: ITranscriptUsageUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { transcriptUsageEntity, transcripts, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/transcript-usage');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getTranscripts();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...transcriptUsageEntity,
        ...values,
        transcript: transcripts.find(it => it.id.toString() === values.transcriptId.toString()),
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
          <h2 id="oncokbTranscriptApp.transcriptUsage.home.createOrEditLabel" data-cy="TranscriptUsageCreateUpdateHeading">
            Create or edit a TranscriptUsage
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : transcriptUsageEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="transcript-usage-id">ID</Label>
                  <AvInput id="transcript-usage-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="sourceLabel" for="transcript-usage-source">
                  Source
                </Label>
                <AvInput
                  id="transcript-usage-source"
                  data-cy="source"
                  type="select"
                  className="form-control"
                  name="source"
                  value={(!isNew && transcriptUsageEntity.source) || 'ONCOKB'}
                >
                  <option value="ONCOKB">ONCOKB</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="transcript-usage-transcript">Transcript</Label>
                <AvInput id="transcript-usage-transcript" data-cy="transcript" type="select" className="form-control" name="transcriptId">
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
              <Button tag={Link} id="cancel-save" to="/transcript-usage" replace color="info">
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
  transcriptUsageEntity: storeState.transcriptUsage.entity,
  loading: storeState.transcriptUsage.loading,
  updating: storeState.transcriptUsage.updating,
  updateSuccess: storeState.transcriptUsage.updateSuccess,
});

const mapDispatchToProps = {
  getTranscripts,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptUsageUpdate);
