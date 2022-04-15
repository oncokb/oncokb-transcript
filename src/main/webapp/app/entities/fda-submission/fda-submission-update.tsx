import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Input, Form } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { FDA_SUBMISSION_REGEX } from 'app/config/constants';
import FormSection from 'app/shared/form/FormSection';
import ValidatedField from 'app/shared/form/ValidatedField';
import ValidatedForm from 'app/shared/form/ValidatedForm';

export interface IFdaSubmissionUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionUpdate = (props: IFdaSubmissionUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);
  const [querySubmissionText, setQuerySubmissionText] = useState('');
  const [isFetch, setFetch] = useState(false);

  const companionDiagnosticDevices = props.companionDiagnosticDevices;
  const fdaSubmissionTypes = props.fdaSubmissionTypes;
  const fdaSubmissionEntity = props.fdaSubmissionEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getCompanionDiagnosticDevices({});
    props.getFdaSubmissionTypes({});
  }, []);

  const handleClose = () => {
    props.history.push('/fda-submission');
  };

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
      id: null,
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultValues = () =>
    isNew
      ? isFetch
        ? {
            ...fdaSubmissionEntity,
            dateReceived: convertDateTimeFromServer(fdaSubmissionEntity.dateReceived),
            decisionDate: convertDateTimeFromServer(fdaSubmissionEntity.decisionDate),
            companionDiagnosticDeviceId: fdaSubmissionEntity?.companionDiagnosticDevice?.id,
            typeId: fdaSubmissionEntity?.type?.id,
          }
        : {
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

  const handleLookupFdaSubmission = async () => {
    if (querySubmissionText === '') {
      return;
    }
    const result = await props.lookupFdaSubmission(querySubmissionText);
    if (result.number) {
      setFetch(true);
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.fdaSubmission.home.createOrEditLabel" data-cy="FdaSubmissionCreateUpdateHeading">
            {isNew ? 'Create' : 'Edit'} Fda Submission
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm onSubmit={saveEntity} defaultValues={defaultValues()}>
              {isNew ? (
                <FormSection sectionTitle="Fetch Information">
                  <ValidatedField
                    label="Submission Number"
                    id="query-submission-number"
                    name="querySubmissionNumber"
                    type="text"
                    validate={{ pattern: { value: FDA_SUBMISSION_REGEX, message: 'Not a valid FDA submission number' } }}
                    value={querySubmissionText}
                    onChange={(e: any) => {
                      setQuerySubmissionText(e.target.value);
                    }}
                  />
                  <Button color="primary" onClick={handleLookupFdaSubmission}>
                    Fetch
                  </Button>
                </FormSection>
              ) : null}
              <FormSection sectionTitle="FDA Submission Info">
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
                <ValidatedField
                  label="Device Name"
                  id="fda-submission-deviceName"
                  name="deviceName"
                  data-cy="deviceName"
                  type="text"
                  validate={{ required: { value: true, message: 'This field is required' } }}
                />
                <ValidatedField label="Generic Name" id="fda-submission-genericName" name="genericName" data-cy="genericName" type="text" />
                <ValidatedField
                  label="Date Received"
                  id="fda-submission-dateReceived"
                  name="dateReceived"
                  data-cy="dateReceived"
                  type="date"
                  placeholder="YYYY-MM-DD"
                />
                <ValidatedField
                  label="Decision Date"
                  id="fda-submission-decisionDate"
                  name="decisionDate"
                  data-cy="decisionDate"
                  type="date"
                  placeholder="YYYY-MM-DD"
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
                  validate={{ required: { value: true, message: 'This field is required' } }}
                >
                  <option value="" hidden>
                    Select CDx
                  </option>
                  {companionDiagnosticDevices
                    ? companionDiagnosticDevices.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </ValidatedField>
                <ValidatedField
                  id="fda-submission-type"
                  name="typeId"
                  data-cy="type"
                  label="Type"
                  type="select"
                  validate={{ required: { value: true, message: 'This field is required' } }}
                >
                  <option value="" hidden>
                    Select Type
                  </option>
                  {fdaSubmissionTypes
                    ? fdaSubmissionTypes.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.shortName}
                        </option>
                      ))
                    : null}
                </ValidatedField>
              </FormSection>
              <FormSection>
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
              </FormSection>
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
  lookupFdaSubmission: storeState.fdaSubmissionStore.lookupFdaSubmission,
  reset: storeState.fdaSubmissionStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionUpdate);
