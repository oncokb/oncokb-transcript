import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface ICategoricalAlterationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CategoricalAlterationUpdate = (props: ICategoricalAlterationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const categoricalAlterationEntity = props.categoricalAlterationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/categorical-alteration');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...categoricalAlterationEntity,
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
          type: 'ONCOKB_MUTATIONS',
          alterationType: 'MUTATION',
          ...categoricalAlterationEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.categoricalAlteration.home.createOrEditLabel" data-cy="CategoricalAlterationCreateUpdateHeading">
            Create or edit a CategoricalAlteration
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
                <ValidatedField name="id" required readOnly id="categorical-alteration-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Name"
                id="categorical-alteration-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Type" id="categorical-alteration-type" name="type" data-cy="type" type="select">
                <option value="ONCOKB_MUTATIONS">ONCOKB_MUTATIONS</option>
                <option value="GAIN_OF_FUNCTION_MUTATIONS">GAIN_OF_FUNCTION_MUTATIONS</option>
                <option value="LOSS_OF_FUNCTION_MUTATIONS">LOSS_OF_FUNCTION_MUTATIONS</option>
                <option value="SWITCH_OF_FUNCTION_MUTATIONS">SWITCH_OF_FUNCTION_MUTATIONS</option>
                <option value="VUS">VUS</option>
                <option value="TRUNCATING_MUTATIONS">TRUNCATING_MUTATIONS</option>
                <option value="FUSIONS">FUSIONS</option>
                <option value="AMPLIFICATION">AMPLIFICATION</option>
                <option value="DELETION">DELETION</option>
                <option value="PROMOTER">PROMOTER</option>
                <option value="WILDTYPE">WILDTYPE</option>
              </ValidatedField>
              <ValidatedField
                label="Alteration Type"
                id="categorical-alteration-alterationType"
                name="alterationType"
                data-cy="alterationType"
                type="select"
              >
                <option value="MUTATION">MUTATION</option>
                <option value="COPY_NUMBER_ALTERATION">COPY_NUMBER_ALTERATION</option>
                <option value="STRUCTURAL_VARIANT">STRUCTURAL_VARIANT</option>
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="NA">NA</option>
              </ValidatedField>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  categoricalAlterationEntity: storeState.categoricalAlterationStore.entity,
  loading: storeState.categoricalAlterationStore.loading,
  updating: storeState.categoricalAlterationStore.updating,
  updateSuccess: storeState.categoricalAlterationStore.updateSuccess,
  getEntity: storeState.categoricalAlterationStore.getEntity,
  updateEntity: storeState.categoricalAlterationStore.updateEntity,
  createEntity: storeState.categoricalAlterationStore.createEntity,
  reset: storeState.categoricalAlterationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlterationUpdate);
