import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';
import { ISynonym } from 'app/shared/model/synonym.model';

export interface ISynonymUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SynonymUpdate = (props: ISynonymUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const synonymEntity = props.synonymEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/synonym' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getArticles({});
    props.getCancerTypes({});
    props.getGenes({});
    props.getNciThesauruses({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = (values: Partial<ISynonym>) => {
    const entity = {
      ...synonymEntity,
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
          ...synonymEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.synonym.home.createOrEditLabel" data-cy="SynonymCreateUpdateHeading">
            Add or edit a Synonym
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="synonym-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Type"
                id="synonym-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Source"
                id="synonym-source"
                name="source"
                data-cy="source"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Code" id="synonym-code" name="code" data-cy="code" type="text" />
              <ValidatedField
                label="Name"
                id="synonym-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Note" id="synonym-note" name="note" data-cy="note" type="textarea" />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  articles: storeState.articleStore.entities,
  cancerTypes: storeState.cancerTypeStore.entities,
  genes: storeState.geneStore.entities,
  nciThesauruses: storeState.nciThesaurusStore.entities,
  synonymEntity: storeState.synonymStore.entity,
  loading: storeState.synonymStore.loading,
  updating: storeState.synonymStore.updating,
  updateSuccess: storeState.synonymStore.updateSuccess,
  getArticles: storeState.articleStore.getEntities,
  getCancerTypes: storeState.cancerTypeStore.getEntities,
  getGenes: storeState.geneStore.getEntities,
  getNciThesauruses: storeState.nciThesaurusStore.getEntities,
  getEntity: storeState.synonymStore.getEntity,
  updateEntity: storeState.synonymStore.updateEntity,
  createEntity: storeState.synonymStore.createEntity,
  reset: storeState.synonymStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SynonymUpdate);
