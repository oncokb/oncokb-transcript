import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';
import { generateUuid } from 'app/shared/util/utils';
import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';

export interface IGenomicIndicatorUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomicIndicatorUpdate = (props: IGenomicIndicatorUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const genomicIndicatorEntity = props.genomicIndicatorEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/genomic-indicator');
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

  const saveEntity = (values: IGenomicIndicator) => {
    const entity = {
      ...genomicIndicatorEntity,
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
          uuid: generateUuid(),
        }
      : {
          ...genomicIndicatorEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.genomicIndicator.home.createOrEditLabel" data-cy="GenomicIndicatorCreateUpdateHeading">
            Add or edit a GenomicIndicator
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
                <ValidatedField name="id" required readOnly id="genomic-indicator-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Type"
                id="genomic-indicator-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="UUID"
                id="genomic-indicator-uuid"
                name="uuid"
                data-cy="uuid"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
                disabled
              />
              <ValidatedField
                label="Name"
                id="genomic-indicator-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
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
  genomicIndicatorEntity: storeState.genomicIndicatorStore.entity,
  loading: storeState.genomicIndicatorStore.loading,
  updating: storeState.genomicIndicatorStore.updating,
  updateSuccess: storeState.genomicIndicatorStore.updateSuccess,
  getEntity: storeState.genomicIndicatorStore.getEntity,
  updateEntity: storeState.genomicIndicatorStore.updateEntity,
  createEntity: storeState.genomicIndicatorStore.createEntity,
  reset: storeState.genomicIndicatorStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IGenomicIndicatorUpdateProps, StoreProps>(mapStoreToProps)(GenomicIndicatorUpdate);
