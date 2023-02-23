import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IClinicalTrialsGovCondition } from 'app/shared/model/clinical-trials-gov-condition.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import CancerTypeSelect from 'app/shared/select/CancerTypeSelect';
import { getCancerTypeName } from 'app/shared/util/utils';

export interface IClinicalTrialsGovConditionUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ClinicalTrialsGovConditionUpdate = (props: IClinicalTrialsGovConditionUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const cancerTypes = props.cancerTypes;
  const clinicalTrialsGovConditionEntity = props.clinicalTrialsGovConditionEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;
  let selectedCancerTypes = [];

  const handleClose = () => {
    props.history.push('/clinical-trials-gov-condition' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getCancerTypes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...clinicalTrialsGovConditionEntity,
      ...values,
      cancerTypes:
        selectedCancerTypes.map(ct => {
          return { id: ct.value };
        }) || [],
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
          ...clinicalTrialsGovConditionEntity,
        };

  const onCancerTypeChange = associatedCancerTypes => {
    selectedCancerTypes = associatedCancerTypes;
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2
            id="oncokbCurationApp.clinicalTrialsGovCondition.home.createOrEditLabel"
            data-cy="ClinicalTrialsGovConditionCreateUpdateHeading"
          >
            Create or edit a condition
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
                <ValidatedField
                  name="id"
                  required
                  readOnly
                  id="clinical-trials-gov-condition-id"
                  label="ID"
                  validate={{ required: true }}
                />
              ) : null}
              <ValidatedField
                label="Name"
                id="clinical-trials-gov-condition-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <label>Cancer Types</label>
              <CancerTypeSelect
                defaultValue={
                  props.clinicalTrialsGovConditionEntity.cancerTypes
                    ? props.clinicalTrialsGovConditionEntity.cancerTypes.map(ct => {
                        return {
                          value: ct.id,
                          label: getCancerTypeName(ct),
                        };
                      })
                    : []
                }
                onChange={onCancerTypeChange}
                isMulti
                className={'mb-5'}
              />
              <Button
                tag={Link}
                id="cancel-save"
                data-cy="entityCreateCancelButton"
                to="/clinical-trials-gov-condition"
                replace
                color="info"
              >
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
  cancerTypes: storeState.cancerTypeStore.entities,
  clinicalTrialsGovConditionEntity: storeState.clinicalTrialsGovConditionStore.entity,
  loading: storeState.clinicalTrialsGovConditionStore.loading,
  updating: storeState.clinicalTrialsGovConditionStore.updating,
  updateSuccess: storeState.clinicalTrialsGovConditionStore.updateSuccess,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getEntity: storeState.clinicalTrialsGovConditionStore.getEntity,
  updateEntity: storeState.clinicalTrialsGovConditionStore.updateEntity,
  createEntity: storeState.clinicalTrialsGovConditionStore.createEntity,
  reset: storeState.clinicalTrialsGovConditionStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialsGovConditionUpdate);
