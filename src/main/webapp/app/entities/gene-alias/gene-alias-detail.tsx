import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IGeneAliasDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneAliasDetail = (props: IGeneAliasDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const geneAliasEntity = props.geneAliasEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="geneAliasDetailsHeading">GeneAlias</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{geneAliasEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{geneAliasEntity.name}</dd>
          <dt>Gene</dt>
          <dd>{geneAliasEntity.gene ? geneAliasEntity.gene.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/gene-alias" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/gene-alias/${geneAliasEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ geneAliasStore }: IRootStore) => ({
  geneAliasEntity: geneAliasStore.entity,
  getEntity: geneAliasStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneAliasDetail);
