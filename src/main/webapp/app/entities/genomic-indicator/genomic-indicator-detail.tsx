import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IGenomicIndicatorDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomicIndicatorDetail = (props: IGenomicIndicatorDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomicIndicatorEntity = props.genomicIndicatorEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="genomicIndicatorDetailsHeading">GenomicIndicator</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{genomicIndicatorEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{genomicIndicatorEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{genomicIndicatorEntity.name}</dd>
          <dt>Association</dt>
          <dd>
            {genomicIndicatorEntity.associations
              ? genomicIndicatorEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {genomicIndicatorEntity.associations && i === genomicIndicatorEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/genomic-indicator" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/genomic-indicator/${genomicIndicatorEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ genomicIndicatorStore }: IRootStore) => ({
  genomicIndicatorEntity: genomicIndicatorStore.entity,
  getEntity: genomicIndicatorStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomicIndicatorDetail);
