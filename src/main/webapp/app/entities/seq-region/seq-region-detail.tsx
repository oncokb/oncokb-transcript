import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface ISeqRegionDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const SeqRegionDetail = (props: ISeqRegionDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const seqRegionEntity = props.seqRegionEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="seqRegionDetailsHeading">SeqRegion</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{seqRegionEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{seqRegionEntity.name}</dd>
          <dt>
            <span id="chromosome">Chromosome</span>
          </dt>
          <dd>{seqRegionEntity.chromosome}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{seqRegionEntity.description}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={seqRegionEntity.id}
          entityType={ENTITY_TYPE.SEQ_REGION}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ seqRegionStore }: IRootStore) => ({
  seqRegionEntity: seqRegionStore.entity,
  getEntity: seqRegionStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SeqRegionDetail);
