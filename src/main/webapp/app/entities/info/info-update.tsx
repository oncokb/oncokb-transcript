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
          lastUpdated: displayDefaultDateTime(),
        }
      : {
          type: 'NCIT_VERSION',
          ...infoEntity,
          lastUpdated: convertDateTimeFromServer(infoEntity.lastUpdated),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.info.home.createOrEditLabel" data-cy="InfoCreateUpdateHeading">
            Create or edit a Info
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
              <ValidatedField label="Type" id="info-type" name="type" data-cy="type" type="select">
                <option value="NCIT_VERSION">NCIT_VERSION</option>
                <option value="GENE_LAST_UPDATED">GENE_LAST_UPDATED</option>
              </ValidatedField>
              <ValidatedField label="Value" id="info-value" name="value" data-cy="value" type="text" />
              <ValidatedField
                label="Last Updated"
                id="info-lastUpdated"
                name="lastUpdated"
                data-cy="lastUpdated"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/info" replace color="info">
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
