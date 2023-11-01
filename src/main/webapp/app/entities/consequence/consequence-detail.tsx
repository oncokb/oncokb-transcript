import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
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
            <span id="alterationType">Alteration Type</span>
          </dt>
          <dd>{consequenceEntity.alterationType}</dd>
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
        <EntityActionButton
          color="primary"
          entityId={consequenceEntity.id}
          entityType={ENTITY_TYPE.CONSEQUENCE}
          entityAction={ENTITY_ACTION.EDIT}
        />
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
