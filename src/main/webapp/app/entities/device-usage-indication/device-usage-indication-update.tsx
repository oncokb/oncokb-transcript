import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IDeviceUsageIndicationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DeviceUsageIndicationUpdate = (props: IDeviceUsageIndicationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const fdaSubmissions = props.fdaSubmissions;
  const alterations = props.alterations;
  const cancerTypes = props.cancerTypes;
  const drugs = props.drugs;
  const deviceUsageIndicationEntity = props.deviceUsageIndicationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/device-usage-indication');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getFdaSubmissions({});
    props.getAlterations({});
    props.getCancerTypes({});
    props.getDrugs({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...deviceUsageIndicationEntity,
      ...values,
      fdaSubmission: fdaSubmissions.find(it => it.id.toString() === values.fdaSubmissionId.toString()),
      alteration: alterations.find(it => it.id.toString() === values.alterationId.toString()),
      cancerType: cancerTypes.find(it => it.id.toString() === values.cancerTypeId.toString()),
      drug: drugs.find(it => it.id.toString() === values.drugId.toString()),
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
          ...deviceUsageIndicationEntity,
          fdaSubmissionId: deviceUsageIndicationEntity?.fdaSubmission?.id,
          alterationId: deviceUsageIndicationEntity?.alteration?.id,
          cancerTypeId: deviceUsageIndicationEntity?.cancerType?.id,
          drugId: deviceUsageIndicationEntity?.drug?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.deviceUsageIndication.home.createOrEditLabel" data-cy="DeviceUsageIndicationCreateUpdateHeading">
            Create or edit a DeviceUsageIndication
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
                <ValidatedField name="id" required readOnly id="device-usage-indication-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                id="device-usage-indication-fdaSubmission"
                name="fdaSubmissionId"
                data-cy="fdaSubmission"
                label="Fda Submission"
                type="select"
              >
                <option value="" key="0" />
                {fdaSubmissions
                  ? fdaSubmissions.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                id="device-usage-indication-alteration"
                name="alterationId"
                data-cy="alteration"
                label="Alteration"
                type="select"
              >
                <option value="" key="0" />
                {alterations
                  ? alterations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                id="device-usage-indication-cancerType"
                name="cancerTypeId"
                data-cy="cancerType"
                label="Cancer Type"
                type="select"
              >
                <option value="" key="0" />
                {cancerTypes
                  ? cancerTypes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="device-usage-indication-drug" name="drugId" data-cy="drug" label="Drug" type="select">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
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
  fdaSubmissions: storeState.fdaSubmissionStore.entities,
  alterations: storeState.alterationStore.entities,
  cancerTypes: storeState.cancerTypeStore.entities,
  drugs: storeState.drugStore.entities,
  deviceUsageIndicationEntity: storeState.deviceUsageIndicationStore.entity,
  loading: storeState.deviceUsageIndicationStore.loading,
  updating: storeState.deviceUsageIndicationStore.updating,
  updateSuccess: storeState.deviceUsageIndicationStore.updateSuccess,
  getFdaSubmissions: storeState.fdaSubmissionStore.getEntities,
  getAlterations: storeState.alterationStore.getEntities,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.deviceUsageIndicationStore.getEntity,
  updateEntity: storeState.deviceUsageIndicationStore.updateEntity,
  createEntity: storeState.deviceUsageIndicationStore.createEntity,
  reset: storeState.deviceUsageIndicationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DeviceUsageIndicationUpdate);
