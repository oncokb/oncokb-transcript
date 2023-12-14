import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';
import { ValidatedSelect } from 'app/shared/form/ValidatedField';

export interface ICategoricalAlterationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CategoricalAlterationUpdate = (props: ICategoricalAlterationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const consequences = props.consequences;
  const categoricalAlterationEntity = props.categoricalAlterationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const consequenceOptions = consequences.map(consequence => ({ label: consequence.name, value: consequence.id }));

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
      consequence: values.consequence ? { label: values?.consequence.name, value: values?.consequence.id } : null,
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
          alterationType: 'PROTEIN_CHANGE',
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
                label="Alteration Type"
                id="categorical-alteration-alterationType"
                name="alterationType"
                data-cy="alterationType"
                type="select"
              >
                <option value="GENOMIC_CHANGE">GENOMIC_CHANGE</option>
                <option value="CDNA_CHANGE">CDNA_CHANGE</option>
                <option value="PROTEIN_CHANGE">PROTEIN_CHANGE</option>
                <option value="MUTATION">MUTATION</option>
                <option value="COPY_NUMBER_ALTERATION">COPY_NUMBER_ALTERATION</option>
                <option value="STRUCTURAL_VARIANT">STRUCTURAL_VARIANT</option>
                <option value="ANY">ANY</option>
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="NA">NA</option>
              </ValidatedField>
              <ValidatedField
                label="Type"
                id="categorical-alteration-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
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
              <ValidatedSelect label="Consequence" name={'consequence'} options={consequenceOptions} menuPlacement="top" isClearable />
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
  consequences: storeState.consequenceStore.entities,
  updateSuccess: storeState.categoricalAlterationStore.updateSuccess,
  getEntity: storeState.categoricalAlterationStore.getEntity,
  updateEntity: storeState.categoricalAlterationStore.updateEntity,
  createEntity: storeState.categoricalAlterationStore.createEntity,
  reset: storeState.categoricalAlterationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlterationUpdate);
