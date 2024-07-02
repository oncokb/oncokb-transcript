import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { mapIdList } from 'app/shared/util/entity-utils';

export interface IEligibilityCriteriaUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EligibilityCriteriaUpdate = (props: IEligibilityCriteriaUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const associations = props.associations;
  const clinicalTrials = props.clinicalTrials;
  const eligibilityCriteriaEntity = props.eligibilityCriteriaEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/eligibility-criteria' + props.location.search);
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

  // TYPE-ISSUE: don't know values type
  const saveEntity = values => {
    const entity = {
      ...eligibilityCriteriaEntity,
      ...values,
      associations: mapIdList(values.associations ?? []),
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
          ...eligibilityCriteriaEntity,
          type: eligibilityCriteriaEntity.type ?? 'INCLUSION',
          associations: eligibilityCriteriaEntity?.associations?.map(e => e.id?.toString()),
          clinicalTrialId: eligibilityCriteriaEntity?.clinicalTrial?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.eligibilityCriteria.home.createOrEditLabel" data-cy="EligibilityCriteriaCreateUpdateHeading">
            Add or edit a EligibilityCriteria
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
                <ValidatedField name="id" required readOnly id="eligibility-criteria-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField label="Type" id="eligibility-criteria-type" name="type" data-cy="type" type="select">
                <option value="INCLUSION">INCLUSION</option>
                <option value="EXCLUSION">EXCLUSION</option>
              </ValidatedField>
              <ValidatedField label="Priority" id="eligibility-criteria-priority" name="priority" data-cy="priority" type="text" />
              <ValidatedField label="Criteria" id="eligibility-criteria-criteria" name="criteria" data-cy="criteria" type="textarea" />
              <ValidatedField
                label="Association"
                id="eligibility-criteria-association"
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
                id="eligibility-criteria-clinicalTrial"
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/eligibility-criteria" replace color="info">
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
  eligibilityCriteriaEntity: storeState.eligibilityCriteriaStore.entity,
  loading: storeState.eligibilityCriteriaStore.loading,
  updating: storeState.eligibilityCriteriaStore.updating,
  updateSuccess: storeState.eligibilityCriteriaStore.updateSuccess,
  getAssociations: storeState.associationStore.getEntities,
  getClinicalTrials: storeState.clinicalTrialStore.getEntities,
  getEntity: storeState.eligibilityCriteriaStore.getEntity,
  updateEntity: storeState.eligibilityCriteriaStore.updateEntity,
  createEntity: storeState.eligibilityCriteriaStore.createEntity,
  reset: storeState.eligibilityCriteriaStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EligibilityCriteriaUpdate);
