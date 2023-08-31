import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ISeqRegionDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SeqRegionDetail = (props: ISeqRegionDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const seqRegionEntity = props.seqRegionEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="seqRegionDetailsHeading">SeqRegion</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{seqRegionEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{seqRegionEntity.name}</dd>
          <dt>
            <span id="chromosome">Chromosome</span>
          </dt>
          <dd>{seqRegionEntity.chromosome}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{seqRegionEntity.description}</dd>
        </dl>
        <Button tag={Link} to="/seq-region" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/seq-region/${seqRegionEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ seqRegionStore }: IRootStore) => ({
  seqRegionEntity: seqRegionStore.entity,
  getEntity: seqRegionStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SeqRegionDetail);
