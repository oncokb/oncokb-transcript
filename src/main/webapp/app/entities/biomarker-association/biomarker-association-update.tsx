import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface IBiomarkerAssociationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const BiomarkerAssociationUpdate = (props: IBiomarkerAssociationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const fdaSubmissions = props.fdaSubmissions;
  const alterations = props.alterations;
  const cancerTypes = props.cancerTypes;
  const drugs = props.drugs;
  const biomarkerAssociationEntity = props.biomarkerAssociationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/biomarker-association');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getFdaSubmissions({});
    props.getAlterations({});
    props.getCancerTypes({});
    props.getDrugs({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...biomarkerAssociationEntity,
      ...values,
      fdaSubmission: fdaSubmissions.find(it => it.id.toString() === values.fdaSubmissionId.toString()),
      alteration: alterations.find(it => it.id.toString() === values.alterationId.toString()),
      cancerType: cancerTypes.find(it => it.id.toString() === values.cancerTypeId.toString()),
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
          ...biomarkerAssociationEntity,
          fdaSubmissionId: biomarkerAssociationEntity?.fdaSubmissions || [],
          alterations: biomarkerAssociationEntity?.alterations || [],
          cancerTypeId: biomarkerAssociationEntity?.cancerType?.id,
          drugs: biomarkerAssociationEntity?.drugs || [],
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.biomarkerAssociation.home.createOrEditLabel" data-cy="BiomarkerAssociationCreateUpdateHeading">
            Create or edit a BiomarkerAssociation
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
                <ValidatedField name="id" required readOnly id="biomarker-association-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                id="biomarker-association-fdaSubmission"
                name="fdaSubmissionId"
                data-cy="fdaSubmission"
                label="Fda Submission"
                type="select"
              >
                <option value="" key="0" />
                {fdaSubmissions
                  ? fdaSubmissions.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                id="biomarker-association-alteration"
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
              <ValidatedField
                id="biomarker-association-cancerType"
                name="cancerTypeId"
                data-cy="cancerType"
                label="Cancer Type"
                type="select"
              >
                <option value="" key="0" />
                {cancerTypes
                  ? cancerTypes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="biomarker-association-drug" name="drugId" data-cy="drug" label="Drug" type="select">
                <option value="" key="0" />
                {drugs
                  ? drugs.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  fdaSubmissions: storeState.fdaSubmissionStore.entities,
  alterations: storeState.alterationStore.entities,
  cancerTypes: storeState.cancerTypeStore.entities,
  drugs: storeState.drugStore.entities,
  biomarkerAssociationEntity: storeState.biomarkerAssociationStore.entity,
  loading: storeState.biomarkerAssociationStore.loading,
  updating: storeState.biomarkerAssociationStore.updating,
  updateSuccess: storeState.biomarkerAssociationStore.updateSuccess,
  getFdaSubmissions: storeState.fdaSubmissionStore.getEntities,
  getAlterations: storeState.alterationStore.getEntities,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getDrugs: storeState.drugStore.getEntities,
  getEntity: storeState.biomarkerAssociationStore.getEntity,
  updateEntity: storeState.biomarkerAssociationStore.updateEntity,
  createEntity: storeState.biomarkerAssociationStore.createEntity,
  reset: storeState.biomarkerAssociationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(BiomarkerAssociationUpdate);
