import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';
import { ISeqRegion } from 'app/shared/model/seq-region.model';

export interface ISeqRegionUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SeqRegionUpdate = (props: ISeqRegionUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const seqRegionEntity = props.seqRegionEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/seq-region');
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

  const saveEntity = (values: Partial<ISeqRegion>) => {
    const entity = {
      ...seqRegionEntity,
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
          ...seqRegionEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.seqRegion.home.createOrEditLabel" data-cy="SeqRegionCreateUpdateHeading">
            Add or edit a SeqRegion
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="seq-region-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="seq-region-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Chromosome" id="seq-region-chromosome" name="chromosome" data-cy="chromosome" type="text" />
              <ValidatedField label="Description" id="seq-region-description" name="description" data-cy="description" type="textarea" />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/seq-region" replace color="info">
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
  seqRegionEntity: storeState.seqRegionStore.entity,
  loading: storeState.seqRegionStore.loading,
  updating: storeState.seqRegionStore.updating,
  updateSuccess: storeState.seqRegionStore.updateSuccess,
  getEntity: storeState.seqRegionStore.getEntity,
  updateEntity: storeState.seqRegionStore.updateEntity,
  createEntity: storeState.seqRegionStore.createEntity,
  reset: storeState.seqRegionStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SeqRegionUpdate);
