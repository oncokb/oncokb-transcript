import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IDrug } from 'app/shared/model/drug.model';
import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IDrugSynonymUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugSynonymUpdate = (props: IDrugSynonymUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugs = props.drugs;
  const drugSynonymEntity = props.drugSynonymEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-synonym');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getDrugs({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...drugSynonymEntity,
      ...values,
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
          ...drugSynonymEntity,
          drugId: drugSynonymEntity?.drug?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.drugSynonym.home.createOrEditLabel" data-cy="DrugSynonymCreateUpdateHeading">
            Create or edit a DrugSynonym
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="drug-synonym-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="drug-synonym-name" name="name" data-cy="name" type="textarea" />
              <ValidatedField id="drug-synonym-drug" name="drugId" data-cy="drug" label="Drug" type="select">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/drug-synonym" replace color="info">
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
  drugs: storeState.drugStore.entities,
  drugSynonymEntity: storeState.drugSynonymStore.entity,
  loading: storeState.drugSynonymStore.loading,
  updating: storeState.drugSynonymStore.updating,
  updateSuccess: storeState.drugSynonymStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.drugSynonymStore.getEntity,
  updateEntity: storeState.drugSynonymStore.updateEntity,
  createEntity: storeState.drugSynonymStore.createEntity,
  reset: storeState.drugSynonymStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugSynonymUpdate);
