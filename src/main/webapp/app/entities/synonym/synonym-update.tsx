import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IGene } from 'app/shared/model/gene.model';
import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { ISynonym } from 'app/shared/model/synonym.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface ISynonymUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SynonymUpdate = (props: ISynonymUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const cancerTypes = props.cancerTypes;
  const genes = props.genes;
  const nciThesauruses = props.nciThesauruses;
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

    props.getCancerTypes({});
    props.getGenes({});
    props.getNciThesauruses({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
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
            Create or edit a Synonym
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
              <ValidatedField label="Name" id="synonym-name" name="name" data-cy="name" type="text" />
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
  cancerTypes: storeState.cancerTypeStore.entities,
  genes: storeState.geneStore.entities,
  nciThesauruses: storeState.nciThesaurusStore.entities,
  synonymEntity: storeState.synonymStore.entity,
  loading: storeState.synonymStore.loading,
  updating: storeState.synonymStore.updating,
  updateSuccess: storeState.synonymStore.updateSuccess,
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
