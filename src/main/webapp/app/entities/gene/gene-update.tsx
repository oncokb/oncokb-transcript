import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { getEntity, updateEntity, createEntity, reset } from './gene.reducer';
import { IGene } from 'app/shared/model/gene.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IGeneUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const GeneUpdate = (props: IGeneUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { geneEntity, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/gene');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...geneEntity,
        ...values,
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
            <AvForm model={isNew ? {} : geneEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="gene-id">ID</Label>
                  <AvInput id="gene-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="entrezGeneIdLabel" for="gene-entrezGeneId">
                  Entrez Gene Id
                </Label>
                <AvField id="gene-entrezGeneId" data-cy="entrezGeneId" type="string" className="form-control" name="entrezGeneId" />
              </AvGroup>
              <AvGroup>
                <Label id="hugoSymbolLabel" for="gene-hugoSymbol">
                  Hugo Symbol
                </Label>
                <AvField id="gene-hugoSymbol" data-cy="hugoSymbol" type="text" name="hugoSymbol" />
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/gene" replace color="info">
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
  geneEntity: storeState.gene.entity,
  loading: storeState.gene.loading,
  updating: storeState.gene.updating,
  updateSuccess: storeState.gene.updateSuccess,
});

const mapDispatchToProps = {
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(GeneUpdate);
