import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAssociation } from 'app/shared/model/association.model';
import { ILevelOfEvidence } from 'app/shared/model/level-of-evidence.model';
import { IEvidence } from 'app/shared/model/evidence.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IEvidenceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EvidenceUpdate = (props: IEvidenceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const associations = props.associations;
  const levelOfEvidences = props.levelOfEvidences;
  const evidenceEntity = props.evidenceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/evidence' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAssociations({});
    props.getLevelOfEvidences({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...evidenceEntity,
      ...values,
      levelOfEvidences: mapIdList(values.levelOfEvidences),
      association: associations.find(it => it.id.toString() === values.associationId.toString()),
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
          ...evidenceEntity,
          associationId: evidenceEntity?.association?.id,
          levelOfEvidences: evidenceEntity?.levelOfEvidences?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.evidence.home.createOrEditLabel" data-cy="EvidenceCreateUpdateHeading">
            Create or edit a Evidence
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="evidence-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Uuid" id="evidence-uuid" name="uuid" data-cy="uuid" type="text" />
              <ValidatedField
                label="Evidence Type"
                id="evidence-evidenceType"
                name="evidenceType"
                data-cy="evidenceType"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Known Effect" id="evidence-knownEffect" name="knownEffect" data-cy="knownEffect" type="text" />
              <ValidatedField label="Description" id="evidence-description" name="description" data-cy="description" type="textarea" />
              <ValidatedField label="Note" id="evidence-note" name="note" data-cy="note" type="textarea" />
              <ValidatedField id="evidence-association" name="associationId" data-cy="association" label="Association" type="select">
                <option value="" key="0" />
                {associations
                  ? associations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label="Level Of Evidence"
                id="evidence-levelOfEvidence"
                data-cy="levelOfEvidence"
                type="select"
                multiple
                name="levelOfEvidences"
              >
                <option value="" key="0" />
                {levelOfEvidences
                  ? levelOfEvidences.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/evidence" replace color="info">
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
  associations: storeState.associationStore.entities,
  levelOfEvidences: storeState.levelOfEvidenceStore.entities,
  evidenceEntity: storeState.evidenceStore.entity,
  loading: storeState.evidenceStore.loading,
  updating: storeState.evidenceStore.updating,
  updateSuccess: storeState.evidenceStore.updateSuccess,
  getAssociations: storeState.associationStore.getEntities,
  getLevelOfEvidences: storeState.levelOfEvidenceStore.getEntities,
  getEntity: storeState.evidenceStore.getEntity,
  updateEntity: storeState.evidenceStore.updateEntity,
  createEntity: storeState.evidenceStore.createEntity,
  reset: storeState.evidenceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EvidenceUpdate);
