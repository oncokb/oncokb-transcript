import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { getEntity, updateEntity, createEntity, reset } from './info.reducer';
import { IInfo } from 'app/shared/model/info.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IInfoUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const InfoUpdate = (props: IInfoUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { infoEntity, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/info');
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
    values.lastUpdated = convertDateTimeToServer(values.lastUpdated);

    if (errors.length === 0) {
      const entity = {
        ...infoEntity,
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
          <h2 id="oncokbTranscriptApp.info.home.createOrEditLabel" data-cy="InfoCreateUpdateHeading">
            Create or edit a Info
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : infoEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="info-id">ID</Label>
                  <AvInput id="info-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="typeLabel" for="info-type">
                  Type
                </Label>
                <AvInput
                  id="info-type"
                  data-cy="type"
                  type="select"
                  className="form-control"
                  name="type"
                  value={(!isNew && infoEntity.type) || 'NCIT_VERSION'}
                >
                  <option value="NCIT_VERSION">NCIT_VERSION</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="valueLabel" for="info-value">
                  Value
                </Label>
                <AvField id="info-value" data-cy="value" type="text" name="value" />
              </AvGroup>
              <AvGroup>
                <Label id="lastUpdatedLabel" for="info-lastUpdated">
                  Last Updated
                </Label>
                <AvInput
                  id="info-lastUpdated"
                  data-cy="lastUpdated"
                  type="datetime-local"
                  className="form-control"
                  name="lastUpdated"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.infoEntity.lastUpdated)}
                />
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/info" replace color="info">
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
  infoEntity: storeState.info.entity,
  loading: storeState.info.loading,
  updating: storeState.info.updating,
  updateSuccess: storeState.info.updateSuccess,
});

const mapDispatchToProps = {
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(InfoUpdate);
