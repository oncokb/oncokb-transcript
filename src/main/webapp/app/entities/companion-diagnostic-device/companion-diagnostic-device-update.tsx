import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { mapSelectOptionList } from 'app/shared/util/entity-utils';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface ICompanionDiagnosticDeviceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CompanionDiagnosticDeviceUpdate = (props: ICompanionDiagnosticDeviceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const specimenTypes = props.specimenTypes;
  const companionDiagnosticDeviceEntity = props.companionDiagnosticDeviceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/companion-diagnostic-device');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getSpecimenTypes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity: ICompanionDiagnosticDevice = {
      ...companionDiagnosticDeviceEntity,
      ...values,
      specimenTypes: mapSelectOptionList(values.specimenTypes),
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
          ...companionDiagnosticDeviceEntity,
          specimenTypes: companionDiagnosticDeviceEntity?.specimenTypes?.map(e => ({ label: e.type, value: e.id.toString() })),
        };

  const specimenTypesOptions = specimenTypes?.map(specType => {
    return { label: specType.type, value: specType.id };
  });

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2
            id="oncokbCurationApp.companionDiagnosticDevice.home.createOrEditLabel"
            data-cy="CompanionDiagnosticDeviceCreateUpdateHeading"
          >
            {isNew ? 'Create' : 'Edit'} Companion Diagnostic Device
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
                <ValidatedField name="id" required readOnly id="companion-diagnostic-device-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Name"
                id="companion-diagnostic-device-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Manufacturer"
                id="companion-diagnostic-device-manufacturer"
                name="manufacturer"
                data-cy="manufacturer"
                type="text"
              />
              <ValidatedField
                label="Indication Details"
                id="companion-diagnostic-device-indicationDetails"
                name="indicationDetails"
                data-cy="indicationDetails"
                type="text"
              />
              <ValidatedSelect
                label="Specimen Types"
                name={'specimenTypes'}
                isMulti
                closeMenuOnSelect={false}
                options={specimenTypesOptions}
              />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  specimenTypes: storeState.specimenTypeStore.entities,
  companionDiagnosticDeviceEntity: storeState.companionDiagnosticDeviceStore.entity,
  loading: storeState.companionDiagnosticDeviceStore.loading,
  updating: storeState.companionDiagnosticDeviceStore.updating,
  updateSuccess: storeState.companionDiagnosticDeviceStore.updateSuccess,
  getSpecimenTypes: storeState.specimenTypeStore.getEntities,
  getEntity: storeState.companionDiagnosticDeviceStore.getEntity,
  updateEntity: storeState.companionDiagnosticDeviceStore.updateEntity,
  createEntity: storeState.companionDiagnosticDeviceStore.createEntity,
  reset: storeState.companionDiagnosticDeviceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDeviceUpdate);
