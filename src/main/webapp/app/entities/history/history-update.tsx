import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IHistory } from 'app/shared/model/history.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IHistoryUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const HistoryUpdate = (props: IHistoryUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const historyEntity = props.historyEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/history' + props.location.search);
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
    values.updatedTime = convertDateTimeToServer(values.updatedTime);

    const entity = {
      ...historyEntity,
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
          updatedTime: displayDefaultDateTime(),
        }
      : {
          ...historyEntity,
          updatedTime: convertDateTimeFromServer(historyEntity.updatedTime),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.history.home.createOrEditLabel" data-cy="HistoryCreateUpdateHeading">
            Create or edit a History
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="history-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Type"
                id="history-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Updated Time"
                id="history-updatedTime"
                name="updatedTime"
                data-cy="updatedTime"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField label="Updated By" id="history-updatedBy" name="updatedBy" data-cy="updatedBy" type="text" />
              <ValidatedField label="Entity Name" id="history-entityName" name="entityName" data-cy="entityName" type="text" />
              <ValidatedField label="Entity Id" id="history-entityId" name="entityId" data-cy="entityId" type="text" />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/history" replace color="info">
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
  historyEntity: storeState.historyStore.entity,
  loading: storeState.historyStore.loading,
  updating: storeState.historyStore.updating,
  updateSuccess: storeState.historyStore.updateSuccess,
  getEntity: storeState.historyStore.getEntity,
  updateEntity: storeState.historyStore.updateEntity,
  createEntity: storeState.historyStore.createEntity,
  reset: storeState.historyStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(HistoryUpdate);
