import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';
import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';

export interface ILevelOfEvidenceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const LevelOfEvidenceUpdate = (props: ILevelOfEvidenceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const levelOfEvidenceEntity = props.levelOfEvidenceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/level-of-evidence');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getEvidences({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = (values: ILevelOfEvidence) => {
    const entity = {
      ...levelOfEvidenceEntity,
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
          ...levelOfEvidenceEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.levelOfEvidence.home.createOrEditLabel" data-cy="LevelOfEvidenceCreateUpdateHeading">
            Add or edit a LevelOfEvidence
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="level-of-evidence-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Type"
                id="level-of-evidence-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Level"
                id="level-of-evidence-level"
                name="level"
                data-cy="level"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Description"
                id="level-of-evidence-description"
                name="description"
                data-cy="description"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Html Description"
                id="level-of-evidence-htmlDescription"
                name="htmlDescription"
                data-cy="htmlDescription"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Color"
                id="level-of-evidence-color"
                name="color"
                data-cy="color"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/level-of-evidence" replace color="info">
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
  evidences: storeState.evidenceStore.entities,
  levelOfEvidenceEntity: storeState.levelOfEvidenceStore.entity,
  loading: storeState.levelOfEvidenceStore.loading,
  updating: storeState.levelOfEvidenceStore.updating,
  updateSuccess: storeState.levelOfEvidenceStore.updateSuccess,
  getEvidences: storeState.evidenceStore.getEntities,
  getEntity: storeState.levelOfEvidenceStore.getEntity,
  updateEntity: storeState.levelOfEvidenceStore.updateEntity,
  createEntity: storeState.levelOfEvidenceStore.createEntity,
  reset: storeState.levelOfEvidenceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<ILevelOfEvidenceUpdateProps, StoreProps>(mapStoreToProps)(LevelOfEvidenceUpdate);
