import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface IFeatureFlagUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FeatureFlagUpdate = (props: IFeatureFlagUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const featureFlagEntity = props.featureFlagEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/feature-flag' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getFeatureFlags({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...featureFlagEntity,
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
          ...featureFlagEntity,
          enabled: featureFlagEntity.enabled ?? false,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.featureFlag.home.createOrEditLabel" data-cy="FeatureFlagCreateUpdateHeading">
            Add or edit a FeatureFlag
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="feature-flag-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="feature-flag-name" name="name" data-cy="name" type="text" />
              <ValidatedField label="Description" id="feature-flag-description" name="description" data-cy="description" type="textarea" />
              <ValidatedField label="Enabled" id="feature-flag-enabled" name="enabled" data-cy="enabled" check type="checkbox" />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  featureFlags: storeState.featureFlagStore.entities,
  featureFlagEntity: storeState.featureFlagStore.entity,
  loading: storeState.featureFlagStore.loading,
  updating: storeState.featureFlagStore.updating,
  updateSuccess: storeState.featureFlagStore.updateSuccess,
  getFeatureFlags: storeState.featureFlagStore.getEntities,
  getEntity: storeState.featureFlagStore.getEntity,
  updateEntity: storeState.featureFlagStore.updateEntity,
  createEntity: storeState.featureFlagStore.createEntity,
  reset: storeState.featureFlagStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FeatureFlagUpdate);
