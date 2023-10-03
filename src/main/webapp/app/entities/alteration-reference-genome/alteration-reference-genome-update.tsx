import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAlteration } from 'app/shared/model/alteration.model';
import { IAlterationReferenceGenome } from 'app/shared/model/alteration-reference-genome.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IAlterationReferenceGenomeUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationReferenceGenomeUpdate = (props: IAlterationReferenceGenomeUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const alterations = props.alterations;
  const alterationReferenceGenomeEntity = props.alterationReferenceGenomeEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/alteration-reference-genome');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAlterations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...alterationReferenceGenomeEntity,
      ...values,
      alteration: alterations.find(it => it.id.toString() === values.alterationId.toString()),
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
          referenceGenome: 'GRCh37',
          ...alterationReferenceGenomeEntity,
          alterationId: alterationReferenceGenomeEntity?.alteration?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2
            id="oncokbCurationApp.alterationReferenceGenome.home.createOrEditLabel"
            data-cy="AlterationReferenceGenomeCreateUpdateHeading"
          >
            Create or edit a AlterationReferenceGenome
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
                <ValidatedField name="id" required readOnly id="alteration-reference-genome-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Reference Genome"
                id="alteration-reference-genome-referenceGenome"
                name="referenceGenome"
                data-cy="referenceGenome"
                type="select"
              >
                <option value="GRCh37">GRCh37</option>
                <option value="GRCh38">GRCh38</option>
              </ValidatedField>
              <ValidatedField
                id="alteration-reference-genome-alteration"
                name="alterationId"
                data-cy="alteration"
                label="Alteration"
                type="select"
              >
                <option value="" key="0" />
                {alterations
                  ? alterations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/alteration-reference-genome" replace color="info">
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
  alterations: storeState.alterationStore.entities,
  alterationReferenceGenomeEntity: storeState.alterationReferenceGenomeStore.entity,
  loading: storeState.alterationReferenceGenomeStore.loading,
  updating: storeState.alterationReferenceGenomeStore.updating,
  updateSuccess: storeState.alterationReferenceGenomeStore.updateSuccess,
  getAlterations: storeState.alterationStore.getEntities,
  getEntity: storeState.alterationReferenceGenomeStore.getEntity,
  updateEntity: storeState.alterationReferenceGenomeStore.updateEntity,
  createEntity: storeState.alterationReferenceGenomeStore.createEntity,
  reset: storeState.alterationReferenceGenomeStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationReferenceGenomeUpdate);
