import { PAGE_ROUTE } from 'app/config/constants';
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
    const specimenTypeValues = mapSelectOptionList(values.specimenTypes);
    for (const st of specimenTypeValues) {
      if (typeof st.id === 'string') {
        try {
          const result = (await props.createSpecimenType({ type: st.id, name: st.id })) as any;
          st.id = result.data.id;
        } catch (error) {
          notifyError(error, 'Could not create new specimen type');
        }
      }
    }

    const entity: ICompanionDiagnosticDevice = {
      ...companionDiagnosticDeviceEntity,
      ...values,
      specimenTypes: specimenTypeValues,
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
    <>
      <Row>
        <Col md="8">
          <h2
            id="oncokbCurationApp.companionDiagnosticDevice.home.createOrEditLabel"
            data-cy="CompanionDiagnosticDeviceCreateUpdateHeading"
          >
            {isNew ? 'Create' : 'Edit'} Companion Diagnostic Device
          </h2>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <h4>CDx Details</h4>
              <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
                {!isNew ? (
                  <ValidatedField
                    name="id"
                    required
                    readOnly
                    id="companion-diagnostic-device-id"
                    label="ID"
                    validate={{ required: true }}
                  />
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
                  creatable
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  options={specimenTypesOptions}
                />
                <SaveButton disabled={updating} />
              </ValidatedForm>
            </>
          )}
        </Col>
      </Row>
      {!isNew ? (
        <Row className="mt-4">
          <Col>
            <CdxBiomarkerAssociationTable companionDiagnosticDeviceId={props.companionDiagnosticDeviceEntity.id} editable />
          </Col>
        </Row>
      ) : undefined}
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
