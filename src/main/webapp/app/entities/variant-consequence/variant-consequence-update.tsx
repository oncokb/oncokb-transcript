import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IVariantConsequence } from 'app/shared/model/variant-consequence.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IVariantConsequenceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const VariantConsequenceUpdate = (props: IVariantConsequenceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const variantConsequenceEntity = props.variantConsequenceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/variant-consequence');
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
      ...variantConsequenceEntity,
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
          ...variantConsequenceEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.variantConsequence.home.createOrEditLabel" data-cy="VariantConsequenceCreateUpdateHeading">
            Create or edit a VariantConsequence
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
                <ValidatedField name="id" required readOnly id="variant-consequence-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Term"
                id="variant-consequence-term"
                name="term"
                data-cy="term"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Is Generally Truncating"
                id="variant-consequence-isGenerallyTruncating"
                name="isGenerallyTruncating"
                data-cy="isGenerallyTruncating"
                check
                type="checkbox"
              />
              <ValidatedField
                label="Description"
                id="variant-consequence-description"
                name="description"
                data-cy="description"
                type="text"
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/variant-consequence" replace color="info">
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
  variantConsequenceEntity: storeState.variantConsequenceStore.entity,
  loading: storeState.variantConsequenceStore.loading,
  updating: storeState.variantConsequenceStore.updating,
  updateSuccess: storeState.variantConsequenceStore.updateSuccess,
  getEntity: storeState.variantConsequenceStore.getEntity,
  updateEntity: storeState.variantConsequenceStore.updateEntity,
  createEntity: storeState.variantConsequenceStore.createEntity,
  reset: storeState.variantConsequenceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(VariantConsequenceUpdate);
