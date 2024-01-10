import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAssociation } from 'app/shared/model/association.model';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IAssociationCancerType } from 'app/shared/model/association-cancer-type.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IAssociationCancerTypeUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AssociationCancerTypeUpdate = (props: IAssociationCancerTypeUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const associations = props.associations;
  const cancerTypes = props.cancerTypes;
  const associationCancerTypeEntity = props.associationCancerTypeEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/association-cancer-type');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAssociations({});
    props.getCancerTypes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...associationCancerTypeEntity,
      ...values,
      association: associations.find(it => it.id.toString() === values.associationId.toString()),
      cancerType: cancerTypes.find(it => it.id.toString() === values.cancerTypeId.toString()),
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
          relation: 'INCLUSION',
          ...associationCancerTypeEntity,
          associationId: associationCancerTypeEntity?.association?.id,
          cancerTypeId: associationCancerTypeEntity?.cancerType?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.associationCancerType.home.createOrEditLabel" data-cy="AssociationCancerTypeCreateUpdateHeading">
            Create or edit a AssociationCancerType
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
                <ValidatedField name="id" required readOnly id="association-cancer-type-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField label="Relation" id="association-cancer-type-relation" name="relation" data-cy="relation" type="select">
                <option value="INCLUSION">INCLUSION</option>
                <option value="EXCLUSION">EXCLUSION</option>
                <option value="RELEVANT">RELEVANT</option>
              </ValidatedField>
              <ValidatedField
                id="association-cancer-type-association"
                name="associationId"
                data-cy="association"
                label="Association"
                type="select"
              >
                <option value="" key="0" />
                {associations
                  ? associations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                id="association-cancer-type-cancerType"
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/association-cancer-type" replace color="info">
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
  associations: storeState.associationStore.entities,
  cancerTypes: storeState.cancerTypeStore.entities,
  associationCancerTypeEntity: storeState.associationCancerTypeStore.entity,
  loading: storeState.associationCancerTypeStore.loading,
  updating: storeState.associationCancerTypeStore.updating,
  updateSuccess: storeState.associationCancerTypeStore.updateSuccess,
  getAssociations: storeState.associationStore.getEntities,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getEntity: storeState.associationCancerTypeStore.getEntity,
  updateEntity: storeState.associationCancerTypeStore.updateEntity,
  createEntity: storeState.associationCancerTypeStore.createEntity,
  reset: storeState.associationCancerTypeStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationCancerTypeUpdate);
