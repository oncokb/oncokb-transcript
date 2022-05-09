import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ICancerTypeDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CancerTypeDetail = (props: ICancerTypeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const cancerTypeEntity = props.cancerTypeEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="cancerTypeDetailsHeading">CancerType</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{cancerTypeEntity.id}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{cancerTypeEntity.code}</dd>
          <dt>
            <span id="color">Color</span>
          </dt>
          <dd>{cancerTypeEntity.color}</dd>
          <dt>
            <span id="level">Level</span>
          </dt>
          <dd>{cancerTypeEntity.level}</dd>
          <dt>
            <span id="mainType">Main Type</span>
          </dt>
          <dd>{cancerTypeEntity.mainType}</dd>
          <dt>
            <span id="subtype">Subtype</span>
          </dt>
          <dd>{cancerTypeEntity.subtype}</dd>
          <dt>
            <span id="tissue">Tissue</span>
          </dt>
          <dd>{cancerTypeEntity.tissue}</dd>
          <dt>
            <span id="tumorForm">Tumor Form</span>
          </dt>
          <dd>{cancerTypeEntity.tumorForm}</dd>
          <dt>Parent</dt>
          <dd>{cancerTypeEntity.parent ? cancerTypeEntity.parent.id : ''}</dd>
        </dl>
        <Button tag={Link} to={`/cancer-type/${cancerTypeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ cancerTypeStore }: IRootStore) => ({
  cancerTypeEntity: cancerTypeStore.entity,
  getEntity: cancerTypeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CancerTypeDetail);
