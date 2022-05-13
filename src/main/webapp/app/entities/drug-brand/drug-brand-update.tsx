import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IDrug } from 'app/shared/model/drug.model';
import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IDrugBrandUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugBrandUpdate = (props: IDrugBrandUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugs = props.drugs;
  const drugBrandEntity = props.drugBrandEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/drug-brand');
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
      ...drugBrandEntity,
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
          region: 'US',
          ...drugBrandEntity,
          drugId: drugBrandEntity?.drug?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.drugBrand.home.createOrEditLabel" data-cy="DrugBrandCreateUpdateHeading">
            Create or edit a DrugBrand
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="drug-brand-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="drug-brand-name" name="name" data-cy="name" type="text" />
              <ValidatedField label="Region" id="drug-brand-region" name="region" data-cy="region" type="select" defaultValue="US">
                <option value="US">US</option>
                <option value="EU">EU</option>
              </ValidatedField>
              <ValidatedField id="drug-brand-drug" name="drugId" data-cy="drug" label="Drug" type="select">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
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
  drugs: storeState.drugStore.entities,
  drugBrandEntity: storeState.drugBrandStore.entity,
  loading: storeState.drugBrandStore.loading,
  updating: storeState.drugBrandStore.updating,
  updateSuccess: storeState.drugBrandStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.drugBrandStore.getEntity,
  updateEntity: storeState.drugBrandStore.updateEntity,
  createEntity: storeState.drugBrandStore.createEntity,
  reset: storeState.drugBrandStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugBrandUpdate);
