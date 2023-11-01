import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { ISynonym } from 'app/shared/model/synonym.model';
import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { SaveButton } from 'app/shared/button/SaveButton';

export interface INciThesaurusUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const NciThesaurusUpdate = (props: INciThesaurusUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const synonyms = props.synonyms;
  const nciThesaurusEntity = props.nciThesaurusEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/nci-thesaurus' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getSynonyms({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...nciThesaurusEntity,
      ...values,
      synonyms: mapIdList(values.synonyms),
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
          ...nciThesaurusEntity,
          synonyms: nciThesaurusEntity?.synonyms?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.nciThesaurus.home.createOrEditLabel" data-cy="NciThesaurusCreateUpdateHeading">
            Create or edit a NciThesaurus
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="nci-thesaurus-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField
                label="Version"
                id="nci-thesaurus-version"
                name="version"
                data-cy="version"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Code"
                id="nci-thesaurus-code"
                name="code"
                data-cy="code"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Preferred Name"
                id="nci-thesaurus-preferredName"
                name="preferredName"
                data-cy="preferredName"
                type="text"
              />
              <ValidatedField label="Display Name" id="nci-thesaurus-displayName" name="displayName" data-cy="displayName" type="text" />
              <ValidatedField label="Synonym" id="nci-thesaurus-synonym" data-cy="synonym" type="select" multiple name="synonyms">
                <option value="" key="0" />
                {synonyms
                  ? synonyms.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
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
  synonyms: storeState.synonymStore.entities,
  nciThesaurusEntity: storeState.nciThesaurusStore.entity,
  loading: storeState.nciThesaurusStore.loading,
  updating: storeState.nciThesaurusStore.updating,
  updateSuccess: storeState.nciThesaurusStore.updateSuccess,
  getSynonyms: storeState.synonymStore.getEntities,
  getEntity: storeState.nciThesaurusStore.getEntity,
  updateEntity: storeState.nciThesaurusStore.updateEntity,
  createEntity: storeState.nciThesaurusStore.createEntity,
  reset: storeState.nciThesaurusStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(NciThesaurusUpdate);
