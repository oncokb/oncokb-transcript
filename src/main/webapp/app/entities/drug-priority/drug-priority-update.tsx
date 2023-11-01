import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IDrug } from 'app/shared/model/drug.model';
import { IDrugPriority } from 'app/shared/model/drug-priority.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IDrugPriorityUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugPriorityUpdate = (props: IDrugPriorityUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugs = props.drugs;
  const drugPriorityEntity = props.drugPriorityEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-priority');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getDrugs({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...drugPriorityEntity,
      ...values,
      drug: drugs.find(it => it.id.toString() === values.drugId.toString()),
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
          ...drugPriorityEntity,
          drugId: drugPriorityEntity?.drug?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.drugPriority.home.createOrEditLabel" data-cy="DrugPriorityCreateUpdateHeading">
            Create or edit a DrugPriority
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
                <ValidatedField name="id" required readOnly id="drug-priority-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Priority"
                id="drug-priority-priority"
                name="priority"
                data-cy="priority"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField id="drug-priority-drug" name="drugId" data-cy="drug" label="Drug" type="select">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/drug-priority" replace color="info">
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
  drugs: storeState.drugStore.entities,
  drugPriorityEntity: storeState.drugPriorityStore.entity,
  loading: storeState.drugPriorityStore.loading,
  updating: storeState.drugPriorityStore.updating,
  updateSuccess: storeState.drugPriorityStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.drugPriorityStore.getEntity,
  updateEntity: storeState.drugPriorityStore.updateEntity,
  createEntity: storeState.drugPriorityStore.createEntity,
  reset: storeState.drugPriorityStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugPriorityUpdate);
