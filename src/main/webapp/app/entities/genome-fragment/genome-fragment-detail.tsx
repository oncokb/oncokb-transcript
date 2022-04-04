import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IGenomeFragmentDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomeFragmentDetail = (props: IGenomeFragmentDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomeFragmentEntity = props.genomeFragmentEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="genomeFragmentDetailsHeading">GenomeFragment</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{genomeFragmentEntity.id}</dd>
          <dt>
            <span id="chromosome">Chromosome</span>
          </dt>
          <dd>{genomeFragmentEntity.chromosome}</dd>
          <dt>
            <span id="start">Start</span>
          </dt>
          <dd>{genomeFragmentEntity.start}</dd>
          <dt>
            <span id="end">End</span>
          </dt>
          <dd>{genomeFragmentEntity.end}</dd>
          <dt>
            <span id="strand">Strand</span>
          </dt>
          <dd>{genomeFragmentEntity.strand}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{genomeFragmentEntity.type}</dd>
          <dt>Transcript</dt>
          <dd>{genomeFragmentEntity.transcript ? genomeFragmentEntity.transcript.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/genome-fragment" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/genome-fragment/${genomeFragmentEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ genomeFragmentStore }: IRootStore) => ({
  genomeFragmentEntity: genomeFragmentStore.entity,
  getEntity: genomeFragmentStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomeFragmentDetail);
