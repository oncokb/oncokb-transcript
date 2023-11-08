import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';

export interface IArticleUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ArticleUpdate = (props: IArticleUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

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
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...articleEntity,
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
          type: 'PMID',
          ...articleEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.article.home.createOrEditLabel" data-cy="ArticleCreateUpdateHeading">
            Create or edit a Article
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
                <option value="PMID">PMID</option>
                <option value="ABSTRACT">ABSTRACT</option>
              </ValidatedField>
              <ValidatedField label="Content" id="article-content" name="content" data-cy="content" type="textarea" />
              <ValidatedField label="Link" id="article-link" name="link" data-cy="link" type="text" />
              <ValidatedField label="Pmid" id="article-pmid" name="pmid" data-cy="pmid" type="text" />
              <ValidatedField label="Elocation Id" id="article-elocationId" name="elocationId" data-cy="elocationId" type="text" />
              <ValidatedField label="Title" id="article-title" name="title" data-cy="title" type="textarea" />
              <ValidatedField label="Authors" id="article-authors" name="authors" data-cy="authors" type="text" />
              <ValidatedField label="Journal" id="article-journal" name="journal" data-cy="journal" type="text" />
              <ValidatedField label="Volume" id="article-volume" name="volume" data-cy="volume" type="text" />
              <ValidatedField label="Issue" id="article-issue" name="issue" data-cy="issue" type="text" />
              <ValidatedField label="Pages" id="article-pages" name="pages" data-cy="pages" type="text" />
              <ValidatedField label="Pub Date" id="article-pubDate" name="pubDate" data-cy="pubDate" type="text" />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  articleEntity: storeState.articleStore.entity,
  loading: storeState.articleStore.loading,
  updating: storeState.articleStore.updating,
  updateSuccess: storeState.articleStore.updateSuccess,
  getEntity: storeState.articleStore.getEntity,
  updateEntity: storeState.articleStore.updateEntity,
  createEntity: storeState.articleStore.createEntity,
  reset: storeState.articleStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ArticleUpdate);
