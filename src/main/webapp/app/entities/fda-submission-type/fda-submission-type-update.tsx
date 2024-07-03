import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface IFdaSubmissionTypeUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionTypeUpdate = (props: IFdaSubmissionTypeUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const fdaSubmissionTypeEntity = props.fdaSubmissionTypeEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-submission-type');
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
      ...fdaSubmissionTypeEntity,
      ...values,
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
          type: 'DEVICE_PMA',
          ...fdaSubmissionTypeEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.fdaSubmissionType.home.createOrEditLabel" data-cy="FdaSubmissionTypeCreateUpdateHeading">
            {isNew ? 'Add' : 'Edit'} FDA Submission Type
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
                <ValidatedField name="id" required readOnly id="fda-submission-type-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField label="Type" id="fda-submission-type-type" name="type" data-cy="type" type="select">
                <option value="DEVICE_PMA">DEVICE_PMA</option>
                <option value="DEVICE_DENOVO">DEVICE_DENOVO</option>
                <option value="DEVICE_HDE">DEVICE_HDE</option>
                <option value="DEVICE_PMN">DEVICE_PMN</option>
                <option value="DRUG_NDA">DRUG_NDA</option>
                <option value="DRUG_BLA">DRUG_BLA</option>
              </ValidatedField>
              <ValidatedField
                label="Name"
                id="fda-submission-type-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Short Name" id="fda-submission-type-shortName" name="shortName" data-cy="shortName" type="text" />
              <ValidatedField
                label="Submission Prefix"
                id="fda-submission-type-submissionPrefix"
                name="submissionPrefix"
                data-cy="submissionPrefix"
                type="text"
              />
              <ValidatedField
                label="Submission Link"
                id="fda-submission-type-submissionLink"
                name="submissionLink"
                data-cy="submissionLink"
                type="text"
              />
              <ValidatedField
                label="Description"
                id="fda-submission-type-description"
                name="description"
                data-cy="description"
                type="textarea"
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
  fdaSubmissionTypeEntity: storeState.fdaSubmissionTypeStore.entity,
  loading: storeState.fdaSubmissionTypeStore.loading,
  updating: storeState.fdaSubmissionTypeStore.updating,
  updateSuccess: storeState.fdaSubmissionTypeStore.updateSuccess,
  getEntity: storeState.fdaSubmissionTypeStore.getEntity,
  updateEntity: storeState.fdaSubmissionTypeStore.updateEntity,
  createEntity: storeState.fdaSubmissionTypeStore.createEntity,
  reset: storeState.fdaSubmissionTypeStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionTypeUpdate);
