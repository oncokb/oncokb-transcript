import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';
import { SaveButton } from 'app/shared/button/SaveButton';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IGeneUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneUpdate = (props: IGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const geneFlags = props.geneFlags;
  const geneEntity = props.geneEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getGeneFlags({});
  }, []);

  const saveEntity = values => {
    const entity = {
      ...geneEntity,
      ...values,
      flags: mapIdList(values.flags),
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          flags: geneEntity?.flags?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.gene.home.createOrEditLabel" data-cy="GeneCreateUpdateHeading">
            {isNew ? 'Add' : 'Edit'} Gene
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
              <ValidatedField label="Entrez Gene ID" id="gene-entrezGeneId" name="entrezGeneId" data-cy="entrezGeneId" type="text" />
              <ValidatedField label="Hugo Symbol" id="gene-hugoSymbol" name="hugoSymbol" data-cy="hugoSymbol" type="text" />
              <ValidatedField label="HGNC ID" id="gene-hgncId" name="hgncId" data-cy="hgncId" type="text" />
              <ValidatedField label="Gene Flag" id="gene-geneFlag" data-cy="geneFlag" type="select" multiple name="flags">
                <option value="" key="0" />
                {geneFlags
                  ? geneFlags
                      .filter(otherEntity => otherEntity.type === 'GENE')
                      .map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
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
  geneFlags: storeState.flagStore.entities,
  geneEntity: storeState.geneStore.entity,
  loading: storeState.geneStore.loading,
  updating: storeState.geneStore.updating,
  updateSuccess: storeState.geneStore.updateSuccess,
  getGeneFlags: storeState.flagStore.getEntities,
  getEntity: storeState.geneStore.getEntity,
  updateEntity: storeState.geneStore.updateEntity,
  createEntity: storeState.geneStore.createEntity,
  reset: storeState.geneStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneUpdate);
