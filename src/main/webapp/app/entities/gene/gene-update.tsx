import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IAlteration } from 'app/shared/model/alteration.model';
import { IGene } from 'app/shared/model/gene.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IGeneUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneUpdate = (props: IGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const alterations = props.alterations;
  const geneEntity = props.geneEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/gene');
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
      ...geneEntity,
      ...values,
      alterations: mapIdList(values.alterations),
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
          ...geneEntity,
          alterations: geneEntity?.alterations?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.gene.home.createOrEditLabel" data-cy="GeneCreateUpdateHeading">
            Create or edit a Gene
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="gene-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Entrez Gene Id" id="gene-entrezGeneId" name="entrezGeneId" data-cy="entrezGeneId" type="text" />
              <ValidatedField label="Hugo Symbol" id="gene-hugoSymbol" name="hugoSymbol" data-cy="hugoSymbol" type="text" />
              <ValidatedField label="Alteration" id="gene-alteration" data-cy="alteration" type="select" multiple name="alterations">
                <option value="" key="0" />
                {alterations
                  ? alterations.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/gene" replace color="info">
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
  geneEntity: storeState.geneStore.entity,
  loading: storeState.geneStore.loading,
  updating: storeState.geneStore.updating,
  updateSuccess: storeState.geneStore.updateSuccess,
  getAlterations: storeState.alterationStore.getEntities,
  getEntity: storeState.geneStore.getEntity,
  updateEntity: storeState.geneStore.updateEntity,
  createEntity: storeState.geneStore.createEntity,
  reset: storeState.geneStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneUpdate);
