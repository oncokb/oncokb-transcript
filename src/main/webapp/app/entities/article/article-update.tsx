import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import { IArticle } from 'app/shared/model/article.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IArticleUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ArticleUpdate = (props: IArticleUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const articleEntity = props.articleEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/article');
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
          ...articleEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbTranscriptApp.article.home.createOrEditLabel" data-cy="ArticleCreateUpdateHeading">
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
              <ValidatedField label="Pmid" id="article-pmid" name="pmid" data-cy="pmid" type="text" />
              <ValidatedField label="Title" id="article-title" name="title" data-cy="title" type="textarea" />
              <ValidatedField label="Journal" id="article-journal" name="journal" data-cy="journal" type="text" />
              <ValidatedField label="Pub Date" id="article-pubDate" name="pubDate" data-cy="pubDate" type="text" />
              <ValidatedField label="Volume" id="article-volume" name="volume" data-cy="volume" type="text" />
              <ValidatedField label="Issue" id="article-issue" name="issue" data-cy="issue" type="text" />
              <ValidatedField label="Pages" id="article-pages" name="pages" data-cy="pages" type="text" />
              <ValidatedField label="Authors" id="article-authors" name="authors" data-cy="authors" type="text" />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/article" replace color="info">
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
