import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        <Button tag={Link} to={`/gene/${geneEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
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
