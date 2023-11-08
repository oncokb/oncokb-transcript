import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
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
            <span id="pmid">Pmid</span>
          </dt>
          <dd>{articleEntity.pmid}</dd>
          <dt>
            <span id="elocationId">Elocation Id</span>
          </dt>
          <dd>{articleEntity.elocationId}</dd>
          <dt>
            <span id="title">Title</span>
          </dt>
          <dd>{articleEntity.title}</dd>
          <dt>
            <span id="authors">Authors</span>
          </dt>
          <dd>{articleEntity.authors}</dd>
          <dt>
            <span id="journal">Journal</span>
          </dt>
          <dd>{articleEntity.journal}</dd>
          <dt>
            <span id="volume">Volume</span>
          </dt>
          <dd>{articleEntity.volume}</dd>
          <dt>
            <span id="issue">Issue</span>
          </dt>
          <dd>{articleEntity.issue}</dd>
          <dt>
            <span id="pages">Pages</span>
          </dt>
          <dd>{articleEntity.pages}</dd>
          <dt>
            <span id="pubDate">Pub Date</span>
          </dt>
          <dd>{articleEntity.pubDate}</dd>
        </dl>
        <EntityActionButton color="primary" entityId={articleEntity.id} entityType={ENTITY_TYPE.GENE} entityAction={ENTITY_ACTION.EDIT} />
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
