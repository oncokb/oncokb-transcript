import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        <Button tag={Link} to="/nci-thesaurus" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/nci-thesaurus/${nciThesaurusEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
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
