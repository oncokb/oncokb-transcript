import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { mapIdList } from 'app/shared/util/entity-utils';

export interface IClinicalTrialArmUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialArmUpdate = (props: IClinicalTrialArmUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const associations = props.associations;
  const clinicalTrials = props.clinicalTrials;
  const clinicalTrialArmEntity = props.clinicalTrialArmEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/clinical-trial-arm' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAssociations({});
    props.getClinicalTrials({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  // TYPE-ISSUE I don't know what type values is
  const saveEntity = values => {
    const entity = {
      ...clinicalTrialArmEntity,
      ...values,
      associations: mapIdList(values.associations),
      clinicalTrial: clinicalTrials.find(it => it.id?.toString() === values.clinicalTrialId.toString()),
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
          ...clinicalTrialArmEntity,
          associations: clinicalTrialArmEntity?.associations?.map(e => e.id?.toString()),
          clinicalTrialId: clinicalTrialArmEntity?.clinicalTrial?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.clinicalTrialArm.home.createOrEditLabel" data-cy="ClinicalTrialArmCreateUpdateHeading">
            Add or edit a ClinicalTrialArm
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
                <ValidatedField name="id" required readOnly id="clinical-trial-arm-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Name"
                id="clinical-trial-arm-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Association"
                id="clinical-trial-arm-association"
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
              <ValidatedField
                id="clinical-trial-arm-clinicalTrial"
                name="clinicalTrialId"
                data-cy="clinicalTrial"
                label="Clinical Trial"
                type="select"
              >
                <option value="" key="0" />
                {clinicalTrials
                  ? clinicalTrials.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/clinical-trial-arm" replace color="info">
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
  clinicalTrials: storeState.clinicalTrialStore.entities,
  clinicalTrialArmEntity: storeState.clinicalTrialArmStore.entity,
  loading: storeState.clinicalTrialArmStore.loading,
  updating: storeState.clinicalTrialArmStore.updating,
  updateSuccess: storeState.clinicalTrialArmStore.updateSuccess,
  getAssociations: storeState.associationStore.getEntities,
  getClinicalTrials: storeState.clinicalTrialStore.getEntities,
  getEntity: storeState.clinicalTrialArmStore.getEntity,
  updateEntity: storeState.clinicalTrialArmStore.updateEntity,
  createEntity: storeState.clinicalTrialArmStore.createEntity,
  reset: storeState.clinicalTrialArmStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialArmUpdate);
