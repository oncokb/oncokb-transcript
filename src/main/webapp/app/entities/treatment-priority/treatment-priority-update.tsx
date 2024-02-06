import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ITreatment } from 'app/shared/model/treatment.model';
import { ITreatmentPriority } from 'app/shared/model/treatment-priority.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITreatmentPriorityUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentPriorityUpdate = (props: ITreatmentPriorityUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const treatments = props.treatments;
  const treatmentPriorityEntity = props.treatmentPriorityEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/treatment-priority');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getTreatments({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...treatmentPriorityEntity,
      ...values,
      treatment: treatments.find(it => it.id.toString() === values.treatmentId.toString()),
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
          ...treatmentPriorityEntity,
          treatmentId: treatmentPriorityEntity?.treatment?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.treatmentPriority.home.createOrEditLabel" data-cy="TreatmentPriorityCreateUpdateHeading">
            Add or edit a TreatmentPriority
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
                <ValidatedField name="id" required readOnly id="treatment-priority-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Priority"
                id="treatment-priority-priority"
                name="priority"
                data-cy="priority"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField id="treatment-priority-treatment" name="treatmentId" data-cy="treatment" label="Treatment" type="select">
                <option value="" key="0" />
                {treatments
                  ? treatments.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/treatment-priority" replace color="info">
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
  treatments: storeState.treatmentStore.entities,
  treatmentPriorityEntity: storeState.treatmentPriorityStore.entity,
  loading: storeState.treatmentPriorityStore.loading,
  updating: storeState.treatmentPriorityStore.updating,
  updateSuccess: storeState.treatmentPriorityStore.updateSuccess,
  getTreatments: storeState.treatmentStore.getEntities,
  getEntity: storeState.treatmentPriorityStore.getEntity,
  updateEntity: storeState.treatmentPriorityStore.updateEntity,
  createEntity: storeState.treatmentPriorityStore.createEntity,
  reset: storeState.treatmentPriorityStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentPriorityUpdate);
