import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IFdaSubmissionUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionUpdate = (props: IFdaSubmissionUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const companionDiagnosticDevices = props.companionDiagnosticDevices;
  const fdaSubmissionTypes = props.fdaSubmissionTypes;
  const fdaSubmissionEntity = props.fdaSubmissionEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-submission');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getCompanionDiagnosticDevices({});
    props.getFdaSubmissionTypes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    values.dateReceived = convertDateTimeToServer(values.dateReceived);
    values.decisionDate = convertDateTimeToServer(values.decisionDate);

    const entity = {
      ...fdaSubmissionEntity,
      ...values,
      companionDiagnosticDevice: companionDiagnosticDevices.find(it => it.id.toString() === values.companionDiagnosticDeviceId.toString()),
      type: fdaSubmissionTypes.find(it => it.id.toString() === values.typeId.toString()),
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          dateReceived: displayDefaultDateTime(),
          decisionDate: displayDefaultDateTime(),
        }
      : {
          ...fdaSubmissionEntity,
          dateReceived: convertDateTimeFromServer(fdaSubmissionEntity.dateReceived),
          decisionDate: convertDateTimeFromServer(fdaSubmissionEntity.decisionDate),
          companionDiagnosticDeviceId: fdaSubmissionEntity?.companionDiagnosticDevice?.id,
          typeId: fdaSubmissionEntity?.type?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.fdaSubmission.home.createOrEditLabel" data-cy="FdaSubmissionCreateUpdateHeading">
            Create or edit a FdaSubmission
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
                <ValidatedField name="id" required readOnly id="fda-submission-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Number"
                id="fda-submission-number"
                name="number"
                data-cy="number"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Supplement Number"
                id="fda-submission-supplementNumber"
                name="supplementNumber"
                data-cy="supplementNumber"
                type="text"
              />
              <ValidatedField label="Device Name" id="fda-submission-deviceName" name="deviceName" data-cy="deviceName" type="text" />
              <ValidatedField label="Generic Name" id="fda-submission-genericName" name="genericName" data-cy="genericName" type="text" />
              <ValidatedField
                label="Date Received"
                id="fda-submission-dateReceived"
                name="dateReceived"
                data-cy="dateReceived"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField
                label="Decision Date"
                id="fda-submission-decisionDate"
                name="decisionDate"
                data-cy="decisionDate"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField
                label="Description"
                id="fda-submission-description"
                name="description"
                data-cy="description"
                type="textarea"
              />
              <ValidatedField
                id="fda-submission-companionDiagnosticDevice"
                name="companionDiagnosticDeviceId"
                data-cy="companionDiagnosticDevice"
                label="Companion Diagnostic Device"
                type="select"
              >
                <option value="" key="0" />
                {companionDiagnosticDevices
                  ? companionDiagnosticDevices.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="fda-submission-type" name="typeId" data-cy="type" label="Type" type="select">
                <option value="" key="0" />
                {fdaSubmissionTypes
                  ? fdaSubmissionTypes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.type}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/fda-submission" replace color="info">
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
  companionDiagnosticDevices: storeState.companionDiagnosticDeviceStore.entities,
  fdaSubmissionTypes: storeState.fdaSubmissionTypeStore.entities,
  fdaSubmissionEntity: storeState.fdaSubmissionStore.entity,
  loading: storeState.fdaSubmissionStore.loading,
  updating: storeState.fdaSubmissionStore.updating,
  updateSuccess: storeState.fdaSubmissionStore.updateSuccess,
  getCompanionDiagnosticDevices: storeState.companionDiagnosticDeviceStore.getEntities,
  getFdaSubmissionTypes: storeState.fdaSubmissionTypeStore.getEntities,
  getEntity: storeState.fdaSubmissionStore.getEntity,
  updateEntity: storeState.fdaSubmissionStore.updateEntity,
  createEntity: storeState.fdaSubmissionStore.createEntity,
  reset: storeState.fdaSubmissionStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionUpdate);