import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './info.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IInfoDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const InfoDetail = (props: IInfoDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { infoEntity } = props;
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
        <Button tag={Link} to="/info" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/info/${infoEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ info }: IRootState) => ({
  infoEntity: info.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(InfoDetail);
