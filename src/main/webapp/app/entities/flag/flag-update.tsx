import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';
import { IFlag } from 'app/shared/model/flag.model';

export interface IFlagUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FlagUpdate = (props: IFlagUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const flagEntity = props.flagEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/flag' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getDrugs({});
    props.getGenes({});
    props.getTranscripts({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = (values: Partial<IFlag>) => {
    const entity = {
      ...flagEntity,
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
          ...flagEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.flag.home.createOrEditLabel" data-cy="FlagCreateUpdateHeading">
            Add or edit a Flag
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="flag-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Type"
                id="flag-type"
                name="type"
                data-cy="type"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Flag"
                id="flag-flag"
                name="flag"
                data-cy="flag"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Name"
                id="flag-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Description"
                id="flag-description"
                name="description"
                data-cy="description"
                type="textarea"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/flag" replace color="info">
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
  drugs: storeState.drugStore.entities,
  genes: storeState.geneStore.entities,
  transcripts: storeState.transcriptStore.entities,
  flagEntity: storeState.flagStore.entity,
  loading: storeState.flagStore.loading,
  updating: storeState.flagStore.updating,
  updateSuccess: storeState.flagStore.updateSuccess,
  getDrugs: storeState.drugStore.getEntities,
  getGenes: storeState.geneStore.getEntities,
  getTranscripts: storeState.transcriptStore.getEntities,
  getEntity: storeState.flagStore.getEntity,
  updateEntity: storeState.flagStore.updateEntity,
  createEntity: storeState.flagStore.createEntity,
  reset: storeState.flagStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FlagUpdate);
