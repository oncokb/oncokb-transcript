import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ISpecimenType } from 'app/shared/model/specimen-type.model';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

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
    const entity = {
      ...companionDiagnosticDeviceEntity,
      ...values,
      specimenTypes: mapIdList(values.specimenTypes),
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
          specimenTypes: companionDiagnosticDeviceEntity?.specimenTypes?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2
            id="oncokbTranscriptApp.companionDiagnosticDevice.home.createOrEditLabel"
            data-cy="CompanionDiagnosticDeviceCreateUpdateHeading"
          >
            Create or edit a CompanionDiagnosticDevice
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
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Specimen Type"
                id="companion-diagnostic-device-specimenType"
                data-cy="specimenType"
                type="select"
                multiple
                name="specimenTypes"
              >
                <option value="" key="0" />
                {specimenTypes
                  ? specimenTypes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.type}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/companion-diagnostic-device" replace color="info">
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
