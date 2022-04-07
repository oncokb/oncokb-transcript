import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IVariantConsequence } from 'app/shared/model/variant-consequence.model';
import { IGene } from 'app/shared/model/gene.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IAlterationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationUpdate = (props: IAlterationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const variantConsequences = props.variantConsequences;
  const genes = props.genes;
  const alterationEntity = props.alterationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/alteration' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getVariantConsequences({});
    props.getGenes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...alterationEntity,
      ...values,
      consequence: variantConsequences.find(it => it.id.toString() === values.consequenceId.toString()),
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
          type: 'MUTATION',
          ...alterationEntity,
          consequenceId: alterationEntity?.consequence?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.alteration.home.createOrEditLabel" data-cy="AlterationCreateUpdateHeading">
            Create or edit a Alteration
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="alteration-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Type" id="alteration-type" name="type" data-cy="type" type="select">
                <option value="MUTATION">MUTATION</option>
                <option value="COPY_NUMBER_ALTERATION">COPY_NUMBER_ALTERATION</option>
                <option value="STRUCTURAL_VARIANT">STRUCTURAL_VARIANT</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </ValidatedField>
              <ValidatedField
                label="Name"
                id="alteration-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Alteration"
                id="alteration-alteration"
                name="alteration"
                data-cy="alteration"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Protein Start" id="alteration-proteinStart" name="proteinStart" data-cy="proteinStart" type="text" />
              <ValidatedField label="Protein End" id="alteration-proteinEnd" name="proteinEnd" data-cy="proteinEnd" type="text" />
              <ValidatedField label="Ref Residues" id="alteration-refResidues" name="refResidues" data-cy="refResidues" type="text" />
              <ValidatedField
                label="Variant Residues"
                id="alteration-variantResidues"
                name="variantResidues"
                data-cy="variantResidues"
                type="text"
              />
              <ValidatedField id="alteration-consequence" name="consequenceId" data-cy="consequence" label="Consequence" type="select">
                <option value="" key="0" />
                {variantConsequences
                  ? variantConsequences.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/alteration" replace color="info">
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
  variantConsequences: storeState.variantConsequenceStore.entities,
  genes: storeState.geneStore.entities,
  alterationEntity: storeState.alterationStore.entity,
  loading: storeState.alterationStore.loading,
  updating: storeState.alterationStore.updating,
  updateSuccess: storeState.alterationStore.updateSuccess,
  getVariantConsequences: storeState.variantConsequenceStore.getEntities,
  getGenes: storeState.geneStore.getEntities,
  getEntity: storeState.alterationStore.getEntity,
  updateEntity: storeState.alterationStore.updateEntity,
  createEntity: storeState.alterationStore.createEntity,
  reset: storeState.alterationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationUpdate);
