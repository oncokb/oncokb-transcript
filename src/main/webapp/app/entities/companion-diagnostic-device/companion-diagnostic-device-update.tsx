import { APP_DATE_FORMAT } from 'app/config/constants/constants';
import { SaveButton } from 'app/shared/button/SaveButton';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import CdxBiomarkerAssociationTable from 'app/shared/table/CdxBiomarkerAssociationTable';
import { mapSelectOptionList } from 'app/shared/util/entity-utils';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import _ from 'lodash';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { convertDateTimeFromServer, convertDateTimeToServer } from 'app/shared/util/date-utils';
import GenericSidebar from 'app/components/sidebar/OncoKBSidebar';
import CompanionDiagnosticDevicePanel from 'app/components/panels/CompanionDiagnosticDevicePanel';
import { WHOLE_NUMBER_REGEX } from 'app/config/constants/regex';

export interface ICompanionDiagnosticDeviceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CompanionDiagnosticDeviceUpdate = (props: ICompanionDiagnosticDeviceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const specimenTypes = props.specimenTypes;
  const companionDiagnosticDeviceEntity = props.companionDiagnosticDeviceEntity;
  const loading = props.loading;
  const updating = props.updating;

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getSpecimenTypes({});
  }, []);

  const saveEntity = async (values: any) => {
    values.lastUpdated = convertDateTimeToServer(values.lastUpdated);

    const specimenTypeValues = mapSelectOptionList(values.specimenTypes);
    const updatedSpecimenTypes = [];
    for (const stv of specimenTypeValues) {
      if (!WHOLE_NUMBER_REGEX.test(stv.id)) {
        try {
          const result = (await props.createSpecimenType({ type: stv.id, name: stv.id })) as any;
          updatedSpecimenTypes.push(result.data);
        } catch (error) {
          notifyError(error, 'Could not create new specimen type');
        }
      } else {
        updatedSpecimenTypes.push(props.specimenTypes.find(st => st.id === parseInt(stv.id, 10)));
      }
    }
    const entity: ICompanionDiagnosticDevice = {
      ...companionDiagnosticDeviceEntity,
      ...values,
      specimenTypes: updatedSpecimenTypes,
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity).then(() => props.getEntity(props.match.params.id));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...companionDiagnosticDeviceEntity,
          specimenTypes: companionDiagnosticDeviceEntity?.specimenTypes?.map(e => ({ label: e.type, value: e.id.toString() })),
          lastUpdated: convertDateTimeFromServer(companionDiagnosticDeviceEntity?.lastUpdated),
        };

  const specimenTypesOptions = specimenTypes?.map(specType => {
    return { label: specType.type, value: `${specType.id}` };
  });

  const biomarkerAssociations = _.uniq(
    (companionDiagnosticDeviceEntity.fdaSubmissions || []).reduce((acc, fdaSubmission) => {
      acc.push(...(fdaSubmission?.associations || []));
      return acc;
    }, [])
  );

  return (
    <>
      <Row>
        <Col md="8">
          <h2
            id="oncokbCurationApp.companionDiagnosticDevice.home.createOrEditLabel"
            data-cy="CompanionDiagnosticDeviceCreateUpdateHeading"
          >
            {isNew ? 'Add' : 'Edit'} Companion Diagnostic Device
          </h2>
        </Col>
      </Row>
      {loading ? (
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
      ) : (
        <>
          <Row className="mt-4">
            <Col md="8">
              <h4>CDx Details</h4>
              <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
                {!isNew ? (
                  <>
                    <ValidatedField
                      name="id"
                      required
                      readOnly
                      id="companion-diagnostic-device-id"
                      label="ID"
                      validate={{ required: true }}
                    />
                    <ValidatedField
                      label="Last Updated"
                      id="fda-submission-lastUpdated"
                      name="lastUpdated"
                      data-cy="lastUpdated"
                      type="date"
                      disabled
                      placeholder={APP_DATE_FORMAT}
                    />
                  </>
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
                <ValidatedField
                  label="Platform Type"
                  id="companion-diagnostic-device-platformType"
                  name="platformType"
                  data-cy="platformType"
                  type="text"
                />
                <ValidatedSelect
                  label="Specimen Types"
                  name={'specimenTypes'}
                  creatable
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  options={specimenTypesOptions}
                />
                <SaveButton disabled={updating} />
              </ValidatedForm>
            </Col>
          </Row>
          {!isNew ? (
            <Row className="mt-4">
              <Col>
                <CdxBiomarkerAssociationTable
                  fdaSubmissions={companionDiagnosticDeviceEntity.fdaSubmissions || []}
                  onDeleteBiomarkerAssociation={() => props.getEntity(props.match.params.id)}
                  editable
                />
              </Col>
            </Row>
          ) : undefined}
        </>
      )}
      <GenericSidebar>
        <CompanionDiagnosticDevicePanel />
      </GenericSidebar>
    </>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  specimenTypes: storeState.specimenTypeStore.entities,
  companionDiagnosticDeviceEntity: storeState.companionDiagnosticDeviceStore.entity,
  loading: storeState.companionDiagnosticDeviceStore.loading,
  updating: storeState.companionDiagnosticDeviceStore.updating,
  getSpecimenTypes: storeState.specimenTypeStore.getEntities,
  getEntity: storeState.companionDiagnosticDeviceStore.getEntity,
  createSpecimenType: storeState.specimenTypeStore.createEntity,
  getSpecimenType: storeState.specimenTypeStore.getEntity,
  updateEntity: storeState.companionDiagnosticDeviceStore.updateEntity,
  createEntity: storeState.companionDiagnosticDeviceStore.createEntity,
  reset: storeState.companionDiagnosticDeviceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CompanionDiagnosticDeviceUpdate);
