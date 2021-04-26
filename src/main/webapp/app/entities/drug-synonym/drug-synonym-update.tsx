import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { setFileData, byteSize, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IDrug } from 'app/shared/model/drug.model';
import { getEntities as getDrugs } from 'app/entities/drug/drug.reducer';
import { getEntity, updateEntity, createEntity, setBlob, reset } from './drug-synonym.reducer';
import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IDrugSynonymUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const DrugSynonymUpdate = (props: IDrugSynonymUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { drugSynonymEntity, drugs, loading, updating } = props;

  const { name } = drugSynonymEntity;

  const handleClose = () => {
    props.history.push('/drug-synonym');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getDrugs();
  }, []);

  const onBlobChange = (isAnImage, name) => event => {
    setFileData(event, (contentType, data) => props.setBlob(name, data, contentType), isAnImage);
  };

  const clearBlob = name => () => {
    props.setBlob(name, undefined, undefined);
  };

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...drugSynonymEntity,
        ...values,
        drug: drugs.find(it => it.id.toString() === values.drugId.toString()),
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
          <h2 id="oncokbTranscriptApp.drugSynonym.home.createOrEditLabel" data-cy="DrugSynonymCreateUpdateHeading">
            Create or edit a DrugSynonym
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : drugSynonymEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="drug-synonym-id">ID</Label>
                  <AvInput id="drug-synonym-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="drug-synonym-name">
                  Name
                </Label>
                <AvInput id="drug-synonym-name" data-cy="name" type="textarea" name="name" />
              </AvGroup>
              <AvGroup>
                <Label for="drug-synonym-drug">Drug</Label>
                <AvInput id="drug-synonym-drug" data-cy="drug" type="select" className="form-control" name="drugId">
                  <option value="" key="0" />
                  {drugs
                    ? drugs.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/drug-synonym" replace color="info">
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
  drugs: storeState.drug.entities,
  drugSynonymEntity: storeState.drugSynonym.entity,
  loading: storeState.drugSynonym.loading,
  updating: storeState.drugSynonym.updating,
  updateSuccess: storeState.drugSynonym.updateSuccess,
});

const mapDispatchToProps = {
  getDrugs,
  getEntity,
  updateEntity,
  setBlob,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(DrugSynonymUpdate);
