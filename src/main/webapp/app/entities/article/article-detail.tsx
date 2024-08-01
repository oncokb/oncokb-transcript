import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { IRootStore } from 'app/stores';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import SynonymBadge from 'app/shared/badge/SynonymBadge';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
export interface IArticleDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ArticleDetail = (props: IArticleDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const articleEntity = props.articleEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="articleDetailsHeading">Article</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{articleEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{articleEntity.type}</dd>
          <dt>
            <span id="content">Content</span>
          </dt>
          <dd>{articleEntity.content}</dd>
          <dt>
            <span id="link">Link</span>
          </dt>
          <dd>{articleEntity.link}</dd>
          <dt>
            <span id="title">Title</span>
          </dt>
          <dd>{articleEntity.title}</dd>
          <dt>
            <span id="authors">Authors</span>
          </dt>
          <dd>{articleEntity.authors}</dd>
          <dt>
            <span id="authors">Synonyms</span>
          </dt>
          <dd>{articleEntity.synonyms?.map((synonym, index) => <SynonymBadge synonym={synonym} key={index} />)}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={articleEntity.id}
          entityType={ENTITY_TYPE.ARTICLE}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ articleStore }: IRootStore) => ({
  articleEntity: articleStore.entity,
  getEntity: articleStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ArticleDetail);
