import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import FormSection from 'app/shared/form/FormSection';
import { SaveButton } from 'app/shared/button/SaveButton';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { FDA_SUBMISSION_REGEX } from 'app/config/constants/regex';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { AiOutlineFileSearch } from 'react-icons/ai';

interface BaseProps extends StoreProps {
  showHeader?: boolean;
}

interface NewSubmissionProps extends BaseProps {
  isNew: true;
  id?: string;
}

interface ExistingSubmissionProps extends BaseProps {
  isNew: false;
  id: string;
}

export type FdaSubmissionFormProps = NewSubmissionProps | ExistingSubmissionProps;

const FdaSubmissionForm = ({
  id,
  isNew,
  loading,
  updating,
  reset,
  getEntity,
  getCompanionDiagnosticDevices,
  companionDiagnosticDevices,
  getFdaSubmissionTypes,
  fdaSubmissionTypes,
  fdaSubmissionEntity,
  createEntity,
  updateEntity,
  lookupFdaSubmission,
  showHeader = true,
}: FdaSubmissionFormProps) => {
  const [isFetchingSubmission, setIsFetchingSubmission] = useState(false);
  const [querySubmissionText, setQuerySubmissionText] = useState('');

  useEffect(() => {
    if (isNew) {
      reset();
    } else {
      getEntity(id);
    }

    getCompanionDiagnosticDevices({});
    getFdaSubmissionTypes({});
  }, []);

  const companionDiagnosticDeviceOptions = companionDiagnosticDevices.map(cdx => ({
    label: cdx.name,
    value: cdx.id,
  }));

  const fdaSubmissionTypeOptions = fdaSubmissionTypes.map(type => ({
    label: type.shortName,
    value: type.id,
  }));

  // TYPE-ISSUE: I don't know what type values is
  const saveEntity = values => {
    values.dateReceived = convertDateTimeToServer(values.dateReceived);
    values.decisionDate = convertDateTimeToServer(values.decisionDate);
    const entity = {
      ...fdaSubmissionEntity,
      ...values,
      companionDiagnosticDevice: companionDiagnosticDevices.find(
        it => it.id.toString() === values.companionDiagnosticDeviceId.value.toString(),
      ),
      type: fdaSubmissionTypes.find(it => it.id.toString() === values.typeId.value.toString()),
      id: isNew ? null : id,
    };

    if (isNew) {
      createEntity(entity);
    } else {
      updateEntity(entity);
    }
  };

  const defaultCompanionDiagnosticDevice = fdaSubmissionEntity?.companionDiagnosticDevice?.id
    ? {
        label: fdaSubmissionEntity.companionDiagnosticDevice.name,
        value: fdaSubmissionEntity.companionDiagnosticDevice.id,
      }
    : undefined;
  const defaultType = fdaSubmissionEntity?.type?.id
    ? {
        label: fdaSubmissionEntity.type.shortName,
        value: fdaSubmissionEntity.type.id,
      }
    : undefined;

  const defaultValues = () =>
    isNew
      ? isFetchingSubmission
        ? {
            ...fdaSubmissionEntity,
            dateReceived: fdaSubmissionEntity.dateReceived ? convertDateTimeFromServer(fdaSubmissionEntity.dateReceived) : null,
            decisionDate: fdaSubmissionEntity.decisionDate ? convertDateTimeFromServer(fdaSubmissionEntity.decisionDate) : null,
            companionDiagnosticDeviceId: defaultCompanionDiagnosticDevice,
            typeId: defaultType,
          }
        : {
            dateReceived: displayDefaultDateTime(),
            decisionDate: displayDefaultDateTime(),
          }
      : {
          ...fdaSubmissionEntity,
          dateReceived: fdaSubmissionEntity.dateReceived ? convertDateTimeFromServer(fdaSubmissionEntity.dateReceived) : null,
          decisionDate: fdaSubmissionEntity.decisionDate ? convertDateTimeFromServer(fdaSubmissionEntity.decisionDate) : null,
          companionDiagnosticDeviceId: defaultCompanionDiagnosticDevice,
          typeId: defaultType,
        };

  const handleLookupFdaSubmission = async () => {
    if (querySubmissionText === '') {
      return;
    }
    try {
      const result = await lookupFdaSubmission(querySubmissionText);
      if (result.number) {
        setIsFetchingSubmission(true);
      }
    } finally {
      setIsFetchingSubmission(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md="8">
        {loading ? (
          <LoadingIndicator isLoading />
        ) : (
          <ValidatedForm onSubmit={saveEntity} defaultValues={defaultValues()}>
            {showHeader && (
              <FormSection isFirst>
                <h2 id="oncokbTranscriptApp.fdaSubmission.home.createOrEditLabel" data-cy="FdaSubmissionCreateUpdateHeading">
                  {isNew ? 'Add' : 'Edit'} FDA Submission
                </h2>
              </FormSection>
            )}
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
                    setQuerySubmissionText?.(e.target.value as string);
                  }}
                />
                <Button color="primary" onClick={handleLookupFdaSubmission}>
                  <AiOutlineFileSearch />
                  <span className="ms-2">Fetch</span>
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
              <ValidatedField
                label="Additional Info"
                id="fda-submission-additionalInfo"
                name="additionalInfo"
                data-cy="additionalInfo"
                type="textarea"
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
              <SaveButton disabled={updating} size="md" />
            </FormSection>
          </ValidatedForm>
        )}
      </Col>
    </Row>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  fdaSubmissionEntity: storeState.fdaSubmissionStore.entity,
  loading: storeState.fdaSubmissionStore.loading,
  updating: storeState.fdaSubmissionStore.updating,
  getCompanionDiagnosticDevices: storeState.companionDiagnosticDeviceStore.getEntities,
  getFdaSubmissionTypes: storeState.fdaSubmissionTypeStore.getEntities,
  getEntity: storeState.fdaSubmissionStore.getEntity,
  reset: storeState.fdaSubmissionStore.reset,
  updateEntity: storeState.fdaSubmissionStore.updateEntity,
  createEntity: storeState.fdaSubmissionStore.createEntity,
  lookupFdaSubmission: storeState.fdaSubmissionStore.lookupFdaSubmission,
  companionDiagnosticDevices: storeState.companionDiagnosticDeviceStore.entities,
  fdaSubmissionTypes: storeState.fdaSubmissionTypeStore.entities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionForm);
