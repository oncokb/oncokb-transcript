import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IVariantConsequenceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const VariantConsequenceDetail = (props: IVariantConsequenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const variantConsequenceEntity = props.variantConsequenceEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="variantConsequenceDetailsHeading">VariantConsequence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{variantConsequenceEntity.id}</dd>
          <dt>
            <span id="term">Term</span>
          </dt>
          <dd>{variantConsequenceEntity.term}</dd>
          <dt>
            <span id="isGenerallyTruncating">Is Generally Truncating</span>
          </dt>
          <dd>{variantConsequenceEntity.isGenerallyTruncating ? 'true' : 'false'}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{variantConsequenceEntity.description}</dd>
        </dl>
        <Button tag={Link} to={`/variant-consequence/${variantConsequenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ variantConsequenceStore }: IRootStore) => ({
  variantConsequenceEntity: variantConsequenceStore.entity,
  getEntity: variantConsequenceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(VariantConsequenceDetail);
