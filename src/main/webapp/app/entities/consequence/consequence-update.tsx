import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';

export interface IConsequenceUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ConsequenceUpdate = (props: IConsequenceUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const consequenceEntity = props.consequenceEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/consequence');
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
    const entity = {
      ...consequenceEntity,
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
          alterationType: 'GENOMIC_CHANGE',
          ...consequenceEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.consequence.home.createOrEditLabel" data-cy="ConsequenceCreateUpdateHeading">
            Create or edit a Consequence
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="consequence-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Alteration Type"
                id="consequence-alterationType"
                name="alterationType"
                data-cy="alterationType"
                type="select"
              >
                <option value="GENOMIC_CHANGE">GENOMIC_CHANGE</option>
                <option value="CDNA_CHANGE">CDNA_CHANGE</option>
                <option value="PROTEIN_CHANGE">PROTEIN_CHANGE</option>
                <option value="COPY_NUMBER_ALTERATION">COPY_NUMBER_ALTERATION</option>
                <option value="STRUCTURAL_VARIANT">STRUCTURAL_VARIANT</option>
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="NA">NA</option>
              </ValidatedField>
              <ValidatedField
                label="Term"
                id="consequence-term"
                name="term"
                data-cy="term"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Name"
                id="consequence-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Is Generally Truncating"
                id="consequence-isGenerallyTruncating"
                name="isGenerallyTruncating"
                data-cy="isGenerallyTruncating"
                check
                type="checkbox"
              />
              <ValidatedField label="Description" id="consequence-description" name="description" data-cy="description" type="text" />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  consequenceEntity: storeState.consequenceStore.entity,
  loading: storeState.consequenceStore.loading,
  updating: storeState.consequenceStore.updating,
  updateSuccess: storeState.consequenceStore.updateSuccess,
  getEntity: storeState.consequenceStore.getEntity,
  updateEntity: storeState.consequenceStore.updateEntity,
  createEntity: storeState.consequenceStore.createEntity,
  reset: storeState.consequenceStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ConsequenceUpdate);
