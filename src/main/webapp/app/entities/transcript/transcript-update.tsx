import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { getEntity, updateEntity, createEntity, reset } from './transcript.reducer';
import { ITranscript } from 'app/shared/model/transcript.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITranscriptUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUpdate = (props: ITranscriptUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { transcriptEntity, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/transcript');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...transcriptEntity,
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
            <AvForm model={isNew ? {} : transcriptEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="transcript-id">ID</Label>
                  <AvInput id="transcript-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="entrezGeneIdLabel" for="transcript-entrezGeneId">
                  Entrez Gene Id
                </Label>
                <AvField
                  id="transcript-entrezGeneId"
                  data-cy="entrezGeneId"
                  type="string"
                  className="form-control"
                  name="entrezGeneId"
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' },
                    number: { value: true, errorMessage: 'This field should be a number.' },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="hugoSymbolLabel" for="transcript-hugoSymbol">
                  Hugo Symbol
                </Label>
                <AvField
                  id="transcript-hugoSymbol"
                  data-cy="hugoSymbol"
                  type="text"
                  name="hugoSymbol"
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="referenceGenomeLabel" for="transcript-referenceGenome">
                  Reference Genome
                </Label>
                <AvInput
                  id="transcript-referenceGenome"
                  data-cy="referenceGenome"
                  type="select"
                  className="form-control"
                  name="referenceGenome"
                  value={(!isNew && transcriptEntity.referenceGenome) || 'GRCh37'}
                >
                  <option value="GRCh37">GRCh37</option>
                  <option value="GRCh38">GRCh38</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="ensemblTranscriptIdLabel" for="transcript-ensemblTranscriptId">
                  Ensembl Transcript Id
                </Label>
                <AvField id="transcript-ensemblTranscriptId" data-cy="ensemblTranscriptId" type="text" name="ensemblTranscriptId" />
              </AvGroup>
              <AvGroup>
                <Label id="ensemblProteinIdLabel" for="transcript-ensemblProteinId">
                  Ensembl Protein Id
                </Label>
                <AvField id="transcript-ensemblProteinId" data-cy="ensemblProteinId" type="text" name="ensemblProteinId" />
              </AvGroup>
              <AvGroup>
                <Label id="referenceSequenceIdLabel" for="transcript-referenceSequenceId">
                  Reference Sequence Id
                </Label>
                <AvField id="transcript-referenceSequenceId" data-cy="referenceSequenceId" type="text" name="referenceSequenceId" />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="transcript-description">
                  Description
                </Label>
                <AvField id="transcript-description" data-cy="description" type="text" name="description" />
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/transcript" replace color="info">
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
  transcriptEntity: storeState.transcript.entity,
  loading: storeState.transcript.loading,
  updating: storeState.transcript.updating,
  updateSuccess: storeState.transcript.updateSuccess,
});

const mapDispatchToProps = {
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptUpdate);
