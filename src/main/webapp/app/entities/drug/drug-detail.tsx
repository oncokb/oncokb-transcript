import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IDrugDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugDetail = (props: IDrugDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugEntity = props.drugEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="drugDetailsHeading">Drug</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{drugEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{drugEntity.name}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{drugEntity.code}</dd>
          <dt>
            <span id="semanticType">Semantic Type</span>
          </dt>
          <dd>{drugEntity.semanticType}</dd>
          <dt>
            <span id="brandNames">Brand Names</span>
          </dt>
          <dd>{drugEntity.brands?.map(brand => brand.name).join(', ')}</dd>
        </dl>
        <Button tag={Link} to={`/drug/${drugEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugEntity: drugStore.entity,
  getEntity: drugStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugDetail);
