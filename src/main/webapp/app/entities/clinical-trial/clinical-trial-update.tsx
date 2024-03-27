import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAssociation } from 'app/shared/model/association.model';
import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IClinicalTrialUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialUpdate = (props: IClinicalTrialUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const associations = props.associations;
  const clinicalTrialEntity = props.clinicalTrialEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/clinical-trial' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAssociations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...clinicalTrialEntity,
      ...values,
      associations: mapIdList(values.associations),
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
          ...clinicalTrialEntity,
          associations: clinicalTrialEntity?.associations?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.clinicalTrial.home.createOrEditLabel" data-cy="ClinicalTrialCreateUpdateHeading">
            Add or edit a ClinicalTrial
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
                <ValidatedField name="id" required readOnly id="clinical-trial-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField label="Nct Id" id="clinical-trial-nctId" name="nctId" data-cy="nctId" type="text" />
              <ValidatedField
                label="Brief Title"
                id="clinical-trial-briefTitle"
                name="briefTitle"
                data-cy="briefTitle"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Phase" id="clinical-trial-phase" name="phase" data-cy="phase" type="text" />
              <ValidatedField label="Status" id="clinical-trial-status" name="status" data-cy="status" type="text" />
              <ValidatedField
                label="Association"
                id="clinical-trial-association"
                data-cy="association"
                type="select"
                multiple
                name="associations"
              >
                <option value="" key="0" />
                {associations
                  ? associations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/clinical-trial" replace color="info">
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
  clinicalTrialEntity: storeState.clinicalTrialStore.entity,
  loading: storeState.clinicalTrialStore.loading,
  updating: storeState.clinicalTrialStore.updating,
  updateSuccess: storeState.clinicalTrialStore.updateSuccess,
  getAssociations: storeState.associationStore.getEntities,
  getEntity: storeState.clinicalTrialStore.getEntity,
  updateEntity: storeState.clinicalTrialStore.updateEntity,
  createEntity: storeState.clinicalTrialStore.createEntity,
  reset: storeState.clinicalTrialStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialUpdate);
