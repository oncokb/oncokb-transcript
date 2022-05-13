import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICancerType } from 'app/shared/model/cancer-type.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ICancerTypeUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CancerTypeUpdate = (props: ICancerTypeUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const cancerTypes = props.cancerTypes;
  const cancerTypeEntity = props.cancerTypeEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/cancer-type' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getCancerTypes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...cancerTypeEntity,
      ...values,
      parent: cancerTypes.find(it => it.id.toString() === values.parentId.toString()),
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
          tumorForm: 'SOLID',
          ...cancerTypeEntity,
          parentId: cancerTypeEntity?.parent?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.cancerType.home.createOrEditLabel" data-cy="CancerTypeCreateUpdateHeading">
            Create or edit a CancerType
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="cancer-type-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Code" id="cancer-type-code" name="code" data-cy="code" type="text" />
              <ValidatedField label="Color" id="cancer-type-color" name="color" data-cy="color" type="text" />
              <ValidatedField
                label="Level"
                id="cancer-type-level"
                name="level"
                data-cy="level"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Main Type"
                id="cancer-type-mainType"
                name="mainType"
                data-cy="mainType"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Subtype" id="cancer-type-subtype" name="subtype" data-cy="subtype" type="text" />
              <ValidatedField label="Tissue" id="cancer-type-tissue" name="tissue" data-cy="tissue" type="text" />
              <ValidatedField label="Tumor Form" id="cancer-type-tumorForm" name="tumorForm" data-cy="tumorForm" type="select">
                <option value="SOLID">SOLID</option>
                <option value="LIQUID">LIQUID</option>
                <option value="MIXED">MIXED</option>
              </ValidatedField>
              <ValidatedField id="cancer-type-parent" name="parentId" data-cy="parent" label="Parent" type="select">
                <option value="" key="0" />
                {cancerTypes
                  ? cancerTypes.map(otherEntity => (
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
  cancerTypes: storeState.cancerTypeStore.entities,
  cancerTypeEntity: storeState.cancerTypeStore.entity,
  loading: storeState.cancerTypeStore.loading,
  updating: storeState.cancerTypeStore.updating,
  updateSuccess: storeState.cancerTypeStore.updateSuccess,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getEntity: storeState.cancerTypeStore.getEntity,
  updateEntity: storeState.cancerTypeStore.updateEntity,
  createEntity: storeState.cancerTypeStore.createEntity,
  reset: storeState.cancerTypeStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CancerTypeUpdate);
