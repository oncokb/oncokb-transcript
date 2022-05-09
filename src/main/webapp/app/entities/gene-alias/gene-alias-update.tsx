import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IGene } from 'app/shared/model/gene.model';
import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IGeneAliasUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneAliasUpdate = (props: IGeneAliasUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const genes = props.genes;
  const geneAliasEntity = props.geneAliasEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/gene-alias');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getGenes({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...geneAliasEntity,
      ...values,
      gene: genes.find(it => it.id.toString() === values.geneId.toString()),
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
          ...geneAliasEntity,
          geneId: geneAliasEntity?.gene?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.geneAlias.home.createOrEditLabel" data-cy="GeneAliasCreateUpdateHeading">
            Create or edit a GeneAlias
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="gene-alias-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name" id="gene-alias-name" name="name" data-cy="name" type="text" />
              <ValidatedField id="gene-alias-gene" name="geneId" data-cy="gene" label="Gene" type="select">
                <option value="" key="0" />
                {genes
                  ? genes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
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
  genes: storeState.geneStore.entities,
  geneAliasEntity: storeState.geneAliasStore.entity,
  loading: storeState.geneAliasStore.loading,
  updating: storeState.geneAliasStore.updating,
  updateSuccess: storeState.geneAliasStore.updateSuccess,
  getGenes: storeState.geneStore.getEntities,
  getEntity: storeState.geneAliasStore.getEntity,
  updateEntity: storeState.geneAliasStore.updateEntity,
  createEntity: storeState.geneAliasStore.createEntity,
  reset: storeState.geneAliasStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneAliasUpdate);
