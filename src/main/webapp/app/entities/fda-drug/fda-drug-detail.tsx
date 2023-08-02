import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IFdaDrugDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaDrugDetail = (props: IFdaDrugDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaDrugEntity = props.fdaDrugEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fdaDrugDetailsHeading">FdaDrug</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fdaDrugEntity.id}</dd>
          <dt>
            <span id="applicationNumber">Application Number</span>
          </dt>
          <dd>{fdaDrugEntity.applicationNumber}</dd>
        </dl>
        <Button tag={Link} to="/fda-drug" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/fda-drug/${fdaDrugEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaDrugStore }: IRootStore) => ({
  fdaDrugEntity: fdaDrugStore.entity,
  getEntity: fdaDrugStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaDrugDetail);
