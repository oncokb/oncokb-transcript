import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IEnsemblGeneDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EnsemblGeneDetail = (props: IEnsemblGeneDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const ensemblGeneEntity = props.ensemblGeneEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="ensemblGeneDetailsHeading">EnsemblGene</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{ensemblGeneEntity.id}</dd>
          <dt>
            <span id="referenceGenome">Reference Genome</span>
          </dt>
          <dd>{ensemblGeneEntity.referenceGenome}</dd>
          <dt>
            <span id="ensemblGeneId">Ensembl Gene Id</span>
          </dt>
          <dd>{ensemblGeneEntity.ensemblGeneId}</dd>
          <dt>
            <span id="canonical">Canonical</span>
          </dt>
          <dd>{ensemblGeneEntity.canonical ? 'true' : 'false'}</dd>
          <dt>
            <span id="chromosome">Chromosome</span>
          </dt>
          <dd>{ensemblGeneEntity.chromosome}</dd>
          <dt>
            <span id="start">Start</span>
          </dt>
          <dd>{ensemblGeneEntity.start}</dd>
          <dt>
            <span id="end">End</span>
          </dt>
          <dd>{ensemblGeneEntity.end}</dd>
          <dt>
            <span id="strand">Strand</span>
          </dt>
          <dd>{ensemblGeneEntity.strand}</dd>
          <dt>Gene</dt>
          <dd>{ensemblGeneEntity.gene ? ensemblGeneEntity.gene.id : ''}</dd>
        </dl>
        <Button tag={Link} to={`/ensembl-gene/${ensemblGeneEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  ensemblGeneEntity: ensemblGeneStore.entity,
  getEntity: ensemblGeneStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGeneDetail);
