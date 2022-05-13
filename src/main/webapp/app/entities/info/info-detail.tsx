import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IInfoDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const InfoDetail = (props: IInfoDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const infoEntity = props.infoEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="infoDetailsHeading">Info</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{infoEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{infoEntity.type}</dd>
          <dt>
            <span id="value">Value</span>
          </dt>
          <dd>{infoEntity.value}</dd>
          <dt>
            <span id="lastUpdated">Last Updated</span>
          </dt>
          <dd>{infoEntity.lastUpdated ? <TextFormat value={infoEntity.lastUpdated} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
        </dl>
        <Button tag={Link} to={`/info/${infoEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ infoStore }: IRootStore) => ({
  infoEntity: infoStore.entity,
  getEntity: infoStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(InfoDetail);
