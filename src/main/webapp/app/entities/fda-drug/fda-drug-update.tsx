import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IDrug } from 'app/shared/model/drug.model';
import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IFdaDrugUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaDrugUpdate = (props: IFdaDrugUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const drugs = props.drugs;
  const fdaDrugEntity = props.fdaDrugEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/fda-drug' + props.location.search);
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
      ...fdaDrugEntity,
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
          ...fdaDrugEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.fdaDrug.home.createOrEditLabel" data-cy="FdaDrugCreateUpdateHeading">
            Create or edit a FdaDrug
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="fda-drug-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Application Number"
                id="fda-drug-applicationNumber"
                name="applicationNumber"
                data-cy="applicationNumber"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/fda-drug" replace color="info">
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
  fdaDrugEntity: storeState.fdaDrugStore.entity,
  loading: storeState.fdaDrugStore.loading,
  updating: storeState.fdaDrugStore.updating,
  updateSuccess: storeState.fdaDrugStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.fdaDrugStore.getEntity,
  updateEntity: storeState.fdaDrugStore.updateEntity,
  createEntity: storeState.fdaDrugStore.createEntity,
  reset: storeState.fdaDrugStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaDrugUpdate);
