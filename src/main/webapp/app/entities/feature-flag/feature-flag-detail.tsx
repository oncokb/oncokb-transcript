import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

export interface IFeatureFlagProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FeatureFlagDetail = (props: IFeatureFlagProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const featureFlagEntity = props.featureFlagEntity;

  return (
    <Row>
      <Col md="8">
        <h2 data-cy="featureFlagDetailsHeading">FeatureFlag</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{featureFlagEntity.id}</dd>
          <dt>
            <span id="code">Name</span>
          </dt>
          <dd>{featureFlagEntity.name}</dd>
          <dt>
            <span id="color">Description</span>
          </dt>
          <dd>{featureFlagEntity.description}</dd>
          <dt>
            <span id="level">Enabled</span>
          </dt>
          <dd>{featureFlagEntity.enabled ? 'true' : 'false'}</dd>
        </dl>
        <Button tag={Link} to={`/feature-flag/${featureFlagEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ featureFlagStore }: IRootStore) => ({
  featureFlagEntity: featureFlagStore.entity,
  getEntity: featureFlagStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FeatureFlagDetail);
