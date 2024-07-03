import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IInfo } from 'app/shared/model/info.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface IInfoUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const InfoUpdate = (props: IInfoUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const infoEntity = props.infoEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/info');
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
    values.created = convertDateTimeToServer(values.created);
    values.lastUpdated = convertDateTimeToServer(values.lastUpdated);

    const entity = {
      ...infoEntity,
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
      ? {
          created: displayDefaultDateTime(),
          lastUpdated: displayDefaultDateTime(),
        }
      : {
          ...infoEntity,
          created: convertDateTimeFromServer(infoEntity.created),
          lastUpdated: convertDateTimeFromServer(infoEntity.lastUpdated),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.info.home.createOrEditLabel" data-cy="InfoCreateUpdateHeading">
            Add or edit a Info
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="info-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Type"
                id="info-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Value" id="info-value" name="value" data-cy="value" type="text" />
              <ValidatedField
                label="Created"
                id="info-created"
                name="created"
                data-cy="created"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Last Updated"
                id="info-lastUpdated"
                name="lastUpdated"
                data-cy="lastUpdated"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
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
  infoEntity: storeState.infoStore.entity,
  loading: storeState.infoStore.loading,
  updating: storeState.infoStore.updating,
  updateSuccess: storeState.infoStore.updateSuccess,
  getEntity: storeState.infoStore.getEntity,
  updateEntity: storeState.infoStore.updateEntity,
  createEntity: storeState.infoStore.createEntity,
  reset: storeState.infoStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(InfoUpdate);
