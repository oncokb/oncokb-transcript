import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { SaveButton } from 'app/shared/button/SaveButton';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';

export interface IDrugUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugUpdate = (props: IDrugUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugEntity = props.drugEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push(getEntityActionRoute(ENTITY_TYPE.DRUG, ENTITY_ACTION.EDIT, props.location.search));
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
      ...drugEntity,
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
          ...drugEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.drug.home.createOrEditLabel" data-cy="DrugCreateUpdateHeading">
            Create or edit a Drug
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="drug-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="drug-name" name="name" data-cy="name" type="textarea" />
              <ValidatedField label="Code" id="drug-code" name="code" data-cy="code" type="text" />
              <ValidatedField label="Semantic Type" id="drug-semanticType" name="semanticType" data-cy="semanticType" type="textarea" />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  drugEntity: storeState.drugStore.entity,
  loading: storeState.drugStore.loading,
  updating: storeState.drugStore.updating,
  updateSuccess: storeState.drugStore.updateSuccess,
  getEntity: storeState.drugStore.getEntity,
  updateEntity: storeState.drugStore.updateEntity,
  createEntity: storeState.drugStore.createEntity,
  reset: storeState.drugStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugUpdate);
