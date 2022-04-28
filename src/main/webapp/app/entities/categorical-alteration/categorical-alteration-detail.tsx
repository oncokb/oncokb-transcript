import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface ICategoricalAlterationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const CategoricalAlterationDetail = (props: ICategoricalAlterationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const categoricalAlterationEntity = props.categoricalAlterationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="categoricalAlterationDetailsHeading">CategoricalAlteration</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{categoricalAlterationEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{categoricalAlterationEntity.name}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{categoricalAlterationEntity.type}</dd>
          <dt>
            <span id="alterationType">Alteration Type</span>
          </dt>
          <dd>{categoricalAlterationEntity.alterationType}</dd>
        </dl>
        <Button tag={Link} to="/categorical-alteration" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/categorical-alteration/${categoricalAlterationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ categoricalAlterationStore }: IRootStore) => ({
  categoricalAlterationEntity: categoricalAlterationStore.entity,
  getEntity: categoricalAlterationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CategoricalAlterationDetail);
