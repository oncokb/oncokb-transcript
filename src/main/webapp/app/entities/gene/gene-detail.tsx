import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IGeneDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneDetail = (props: IGeneDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const geneEntity = props.geneEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="geneDetailsHeading">Gene</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{geneEntity.id}</dd>
          <dt>
            <span id="entrezGeneId">Entrez Gene Id</span>
          </dt>
          <dd>{geneEntity.entrezGeneId}</dd>
          <dt>
            <span id="hugoSymbol">Hugo Symbol</span>
          </dt>
          <dd>{geneEntity.hugoSymbol}</dd>
        </dl>
        <EntityActionButton color="primary" entityId={geneEntity.id} entityType={ENTITY_TYPE.GENE} entityAction={ENTITY_ACTION.EDIT} />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  geneEntity: geneStore.entity,
  getEntity: geneStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneDetail);
