import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface INciThesaurusDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const NciThesaurusDetail = (props: INciThesaurusDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const nciThesaurusEntity = props.nciThesaurusEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="nciThesaurusDetailsHeading">NciThesaurus</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{nciThesaurusEntity.id}</dd>
          <dt>
            <span id="version">Version</span>
          </dt>
          <dd>{nciThesaurusEntity.version}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{nciThesaurusEntity.code}</dd>
          <dt>
            <span id="preferredName">Preferred Name</span>
          </dt>
          <dd>{nciThesaurusEntity.preferredName}</dd>
          <dt>
            <span id="displayName">Display Name</span>
          </dt>
          <dd>{nciThesaurusEntity.displayName}</dd>
          <dt>Synonym</dt>
          <dd>
            {nciThesaurusEntity.synonyms
              ? nciThesaurusEntity.synonyms.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {nciThesaurusEntity.synonyms && i === nciThesaurusEntity.synonyms.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={nciThesaurusEntity.id}
          entityType={ENTITY_TYPE.TRANSCRIPT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ nciThesaurusStore }: IRootStore) => ({
  nciThesaurusEntity: nciThesaurusStore.entity,
  getEntity: nciThesaurusStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(NciThesaurusDetail);
