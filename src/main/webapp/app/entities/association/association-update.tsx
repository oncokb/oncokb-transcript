import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAlteration } from 'app/shared/model/alteration.model';
import { IArticle } from 'app/shared/model/article.model';
import { ITreatment } from 'app/shared/model/treatment.model';
import { IEvidence } from 'app/shared/model/evidence.model';
import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { IClinicalTrialArm } from 'app/shared/model/clinical-trial-arm.model';
import { IEligibilityCriteria } from 'app/shared/model/eligibility-criteria.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';
import { IAssociation } from 'app/shared/model/association.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IAssociationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AssociationUpdate = (props: IAssociationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const alterations = props.alterations;
  const articles = props.articles;
  const treatments = props.treatments;
  const evidences = props.evidences;
  const clinicalTrials = props.clinicalTrials;
  const clinicalTrialArms = props.clinicalTrialArms;
  const eligibilityCriteria = props.eligibilityCriteria;
  const fdaSubmissions = props.fdaSubmissions;
  const genomicIndicators = props.genomicIndicators;
  const associationEntity = props.associationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/association');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getAlterations({});
    props.getArticles({});
    props.getTreatments({});
    props.getEvidences({});
    props.getClinicalTrials({});
    props.getClinicalTrialArms({});
    props.getEligibilityCriteria({});
    props.getFdaSubmissions({});
    props.getGenomicIndicators({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...associationEntity,
      ...values,
      alterations: mapIdList(values.alterations),
      articles: mapIdList(values.articles),
      treatments: mapIdList(values.treatments),
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
          ...associationEntity,
          alterations: associationEntity?.alterations?.map(e => e.id.toString()),
          articles: associationEntity?.articles?.map(e => e.id.toString()),
          treatments: associationEntity?.treatments?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.association.home.createOrEditLabel" data-cy="AssociationCreateUpdateHeading">
            Create or edit a Association
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="association-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="association-name" name="name" data-cy="name" type="text" />
              <ValidatedField label="Alteration" id="association-alteration" data-cy="alteration" type="select" multiple name="alterations">
                <option value="" key="0" />
                {alterations
                  ? alterations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField label="Article" id="association-article" data-cy="article" type="select" multiple name="articles">
                <option value="" key="0" />
                {articles
                  ? articles.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField label="Treatment" id="association-treatment" data-cy="treatment" type="select" multiple name="treatments">
                <option value="" key="0" />
                {treatments
                  ? treatments.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/association" replace color="info">
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
  articles: storeState.articleStore.entities,
  treatments: storeState.treatmentStore.entities,
  evidences: storeState.evidenceStore.entities,
  clinicalTrials: storeState.clinicalTrialStore.entities,
  clinicalTrialArms: storeState.clinicalTrialArmStore.entities,
  eligibilityCriteria: storeState.eligibilityCriteriaStore.entities,
  fdaSubmissions: storeState.fdaSubmissionStore.entities,
  genomicIndicators: storeState.genomicIndicatorStore.entities,
  associationEntity: storeState.associationStore.entity,
  loading: storeState.associationStore.loading,
  updating: storeState.associationStore.updating,
  updateSuccess: storeState.associationStore.updateSuccess,
  getAlterations: storeState.alterationStore.getEntities,
  getArticles: storeState.articleStore.getEntities,
  getTreatments: storeState.treatmentStore.getEntities,
  getEvidences: storeState.evidenceStore.getEntities,
  getClinicalTrials: storeState.clinicalTrialStore.getEntities,
  getClinicalTrialArms: storeState.clinicalTrialArmStore.getEntities,
  getEligibilityCriteria: storeState.eligibilityCriteriaStore.getEntities,
  getFdaSubmissions: storeState.fdaSubmissionStore.getEntities,
  getGenomicIndicators: storeState.genomicIndicatorStore.getEntities,
  getEntity: storeState.associationStore.getEntity,
  updateEntity: storeState.associationStore.updateEntity,
  createEntity: storeState.associationStore.createEntity,
  reset: storeState.associationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationUpdate);
