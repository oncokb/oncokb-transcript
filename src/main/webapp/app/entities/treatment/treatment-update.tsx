import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IDrug } from 'app/shared/model/drug.model';
import { IAssociation } from 'app/shared/model/association.model';
import { ITreatment } from 'app/shared/model/treatment.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface ITreatmentUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const TreatmentUpdate = (props: ITreatmentUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugs = props.drugs;
  const associations = props.associations;
  const treatmentEntity = props.treatmentEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/treatment' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getDrugs({});
    props.getAssociations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...treatmentEntity,
      ...values,
      drugs: mapIdList(values.drugs),
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
          ...treatmentEntity,
          drugs: treatmentEntity?.drugs?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.treatment.home.createOrEditLabel" data-cy="TreatmentCreateUpdateHeading">
            Add or edit a Treatment
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="treatment-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="treatment-name" name="name" data-cy="name" type="text" />
              <ValidatedField label="Drug" id="treatment-drug" data-cy="drug" type="select" multiple name="drugs">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  drugs: storeState.drugStore.entities,
  associations: storeState.associationStore.entities,
  treatmentEntity: storeState.treatmentStore.entity,
  loading: storeState.treatmentStore.loading,
  updating: storeState.treatmentStore.updating,
  updateSuccess: storeState.treatmentStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getAssociations: storeState.associationStore.getEntities,
  getEntity: storeState.treatmentStore.getEntity,
  updateEntity: storeState.treatmentStore.updateEntity,
  createEntity: storeState.treatmentStore.createEntity,
  reset: storeState.treatmentStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(TreatmentUpdate);
