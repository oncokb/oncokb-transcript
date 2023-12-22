import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IGenomicIndicatorDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomicIndicatorDetail = (props: IGenomicIndicatorDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomicIndicatorEntity = props.genomicIndicatorEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="genomicIndicatorDetailsHeading">GenomicIndicator</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{genomicIndicatorEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{genomicIndicatorEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{genomicIndicatorEntity.name}</dd>
          <dt>Association</dt>
          <dd>
            {genomicIndicatorEntity.associations
              ? genomicIndicatorEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {genomicIndicatorEntity.associations && i === genomicIndicatorEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={genomicIndicatorEntity.id}
          entityType={ENTITY_TYPE.TRANSCRIPT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ genomicIndicatorStore }: IRootStore) => ({
  genomicIndicatorEntity: genomicIndicatorStore.entity,
  getEntity: genomicIndicatorStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomicIndicatorDetail);
