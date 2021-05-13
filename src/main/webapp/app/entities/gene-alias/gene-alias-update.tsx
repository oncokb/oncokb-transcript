import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IGene } from 'app/shared/model/gene.model';
import { getEntities as getGenes } from 'app/entities/gene/gene.reducer';
import { getEntity, updateEntity, createEntity, reset } from './gene-alias.reducer';
import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IGeneAliasUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const GeneAliasUpdate = (props: IGeneAliasUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { geneAliasEntity, genes, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/gene-alias');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getGenes();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
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
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.geneAlias.home.createOrEditLabel" data-cy="GeneAliasCreateUpdateHeading">
            Create or edit a GeneAlias
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : geneAliasEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="gene-alias-id">ID</Label>
                  <AvInput id="gene-alias-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="gene-alias-name">
                  Name
                </Label>
                <AvField id="gene-alias-name" data-cy="name" type="text" name="name" />
              </AvGroup>
              <AvGroup>
                <Label for="gene-alias-gene">Gene</Label>
                <AvInput id="gene-alias-gene" data-cy="gene" type="select" className="form-control" name="geneId">
                  <option value="" key="0" />
                  {genes
                    ? genes.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/gene-alias" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  genes: storeState.gene.entities,
  geneAliasEntity: storeState.geneAlias.entity,
  loading: storeState.geneAlias.loading,
  updating: storeState.geneAlias.updating,
  updateSuccess: storeState.geneAlias.updateSuccess,
});

const mapDispatchToProps = {
  getGenes,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(GeneAliasUpdate);
