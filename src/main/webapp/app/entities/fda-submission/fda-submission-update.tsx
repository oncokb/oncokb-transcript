import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { FDA_SUBMISSION_REGEX } from 'app/config/constants';
import FormSection from 'app/shared/form/FormSection';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { SaveButton } from 'app/shared/button/SaveButton';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';

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

  const companionDiagnosticDeviceOptions = props.companionDiagnosticDevices.map(cdx => ({ label: cdx.name, value: cdx.id }));

  const fdaSubmissionTypeOptions = props.fdaSubmissionTypes.map(type => ({ label: type.shortName, value: type.id }));

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
      companionDiagnosticDevice: companionDiagnosticDevices.find(
        it => it.id.toString() === values.companionDiagnosticDeviceId.value.toString()
      ),
      type: fdaSubmissionTypes.find(it => it.id.toString() === values.typeId.value.toString()),
      id: isNew ? null : props.match.params.id,
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultCompanionDiagnosticDevice = {
    label: fdaSubmissionEntity?.companionDiagnosticDevice?.name,
    value: fdaSubmissionEntity?.companionDiagnosticDevice?.id,
  };
  const defaultType = { label: fdaSubmissionEntity?.type?.shortName, value: fdaSubmissionEntity?.type?.id };

  const defaultValues = () =>
    isNew
      ? isFetch
        ? {
            ...fdaSubmissionEntity,
            dateReceived: convertDateTimeFromServer(fdaSubmissionEntity.dateReceived),
            decisionDate: convertDateTimeFromServer(fdaSubmissionEntity.decisionDate),
            companionDiagnosticDeviceId: defaultCompanionDiagnosticDevice,
            typeId: defaultType,
          }
        : {
            dateReceived: displayDefaultDateTime(),
            decisionDate: displayDefaultDateTime(),
          }
      : {
          ...fdaSubmissionEntity,
          dateReceived: convertDateTimeFromServer(fdaSubmissionEntity.dateReceived),
          decisionDate: convertDateTimeFromServer(fdaSubmissionEntity.decisionDate),
          companionDiagnosticDeviceId: defaultCompanionDiagnosticDevice,
          typeId: defaultType,
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
    <Row className="justify-content-center">
      <Col md="8">
        {loading ? (
          <LoadingIndicator isLoading />
        ) : (
          <ValidatedForm onSubmit={saveEntity} defaultValues={defaultValues()}>
            <FormSection isFirst>
              <h2 id="oncokbTranscriptApp.fdaSubmission.home.createOrEditLabel" data-cy="FdaSubmissionCreateUpdateHeading">
                {isNew ? 'Create' : 'Edit'} FDA Submission
              </h2>
            </FormSection>
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
            <FormSection>
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
                label="Curated"
                id="fda-submission-curated"
                name="curated"
                data-cy="curated"
                check={fdaSubmissionEntity?.curated?.toString() || 'false'}
                type="checkbox"
              />
              <ValidatedField
                label="Genetic"
                id="fda-submission-genetic"
                name="genetic"
                data-cy="genetic"
                check={fdaSubmissionEntity?.genetic?.toString() || 'false'}
                type="checkbox"
              />
              <ValidatedSelect
                label="Companion Diagnostic Device"
                name={'companionDiagnosticDeviceId'}
                options={companionDiagnosticDeviceOptions}
                menuPlacement="top"
                validate={{ required: { value: true, message: 'This field is required' } }}
              />
              <ValidatedSelect
                label="Type"
                name={'typeId'}
                options={fdaSubmissionTypeOptions}
                menuPlacement="top"
                validate={{ required: { value: true, message: 'This field is required' } }}
              />
            </FormSection>
            <FormSection>
              <SaveButton disabled={updating} />
            </FormSection>
          </ValidatedForm>
        )}
      </Col>
    </Row>
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
