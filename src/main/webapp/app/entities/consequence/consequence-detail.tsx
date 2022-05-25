import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IConsequenceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const ConsequenceDetail = (props: IConsequenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const consequenceEntity = props.consequenceEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="consequenceDetailsHeading">Consequence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{consequenceEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{consequenceEntity.type}</dd>
          <dt>
            <span id="term">Term</span>
          </dt>
          <dd>{consequenceEntity.term}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{consequenceEntity.name}</dd>
          <dt>
            <span id="isGenerallyTruncating">Is Generally Truncating</span>
          </dt>
          <dd>{consequenceEntity.isGenerallyTruncating ? 'true' : 'false'}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{consequenceEntity.description}</dd>
        </dl>
        <Button tag={Link} to={`/consequence/${consequenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ consequenceStore }: IRootStore) => ({
  consequenceEntity: consequenceStore.entity,
  getEntity: consequenceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ConsequenceDetail);
