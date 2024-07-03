import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IArticleUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ArticleUpdate = (props: IArticleUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const flags = props.flags;
  const synonyms = props.synonyms;
  const associations = props.associations;
  const fdaSubmissions = props.fdaSubmissions;
  const articleEntity = props.articleEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/article' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getFlags({});
    props.getSynonyms({});
    props.getAssociations({});
    props.getFdaSubmissions({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    values.date = convertDateTimeToServer(values.date);

    const entity = {
      ...articleEntity,
      ...values,
      flags: mapIdList(values.flags),
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
      ? {
          date: displayDefaultDateTime(),
        }
      : {
          type: 'PUBMED',
          ...articleEntity,
          date: convertDateTimeFromServer(articleEntity.date),
          flags: articleEntity?.flags?.map(e => e.id.toString()),
          synonyms: articleEntity?.synonyms?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.article.home.createOrEditLabel" data-cy="ArticleCreateUpdateHeading">
            Add or edit a Article
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="article-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Type" id="article-type" name="type" data-cy="type" type="select">
                <option value="PUBMED">PUBMED</option>
                <option value="ABSTRACT">ABSTRACT</option>
                <option value="REFERENCE">REFERENCE</option>
                <option value="FDADRUG_LETTER">FDADRUG_LETTER</option>
                <option value="FDADRUG_LABEL">FDADRUG_LABEL</option>
                <option value="FDADRUG_SUMMARY">FDADRUG_SUMMARY</option>
                <option value="FDADRUG_SUMMARY_REVIEW">FDADRUG_SUMMARY_REVIEW</option>
              </ValidatedField>
              <ValidatedField label="Uid" id="article-uid" name="uid" data-cy="uid" type="text" />
              <ValidatedField label="Title" id="article-title" name="title" data-cy="title" type="textarea" />
              <ValidatedField label="Content" id="article-content" name="content" data-cy="content" type="textarea" />
              <ValidatedField label="Link" id="article-link" name="link" data-cy="link" type="text" />
              <ValidatedField label="Authors" id="article-authors" name="authors" data-cy="authors" type="text" />
              <ValidatedField
                label="Date"
                id="article-date"
                name="date"
                data-cy="date"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField label="Flag" id="article-flag" data-cy="flag" type="select" multiple name="flags">
                <option value="" key="0" />
                {flags
                  ? flags.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField label="Synonym" id="article-synonym" data-cy="synonym" type="select" multiple name="synonyms">
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
  flags: storeState.flagStore.entities,
  synonyms: storeState.synonymStore.entities,
  associations: storeState.associationStore.entities,
  fdaSubmissions: storeState.fdaSubmissionStore.entities,
  articleEntity: storeState.articleStore.entity,
  loading: storeState.articleStore.loading,
  updating: storeState.articleStore.updating,
  updateSuccess: storeState.articleStore.updateSuccess,
  getFlags: storeState.flagStore.getEntities,
  getSynonyms: storeState.synonymStore.getEntities,
  getAssociations: storeState.associationStore.getEntities,
  getFdaSubmissions: storeState.fdaSubmissionStore.getEntities,
  getEntity: storeState.articleStore.getEntity,
  updateEntity: storeState.articleStore.updateEntity,
  createEntity: storeState.articleStore.createEntity,
  reset: storeState.articleStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ArticleUpdate);
