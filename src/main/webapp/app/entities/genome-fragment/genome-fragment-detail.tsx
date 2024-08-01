import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IGenomeFragmentDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomeFragmentDetail = (props: IGenomeFragmentDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomeFragmentEntity = props.genomeFragmentEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="genomeFragmentDetailsHeading">GenomeFragment</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{genomeFragmentEntity.id}</dd>
          <dt>
            <span id="start">Start</span>
          </dt>
          <dd>{genomeFragmentEntity.start}</dd>
          <dt>
            <span id="end">End</span>
          </dt>
          <dd>{genomeFragmentEntity.end}</dd>
          <dt>
            <span id="strand">Strand</span>
          </dt>
          <dd>{genomeFragmentEntity.strand}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{genomeFragmentEntity.type}</dd>
          <dt>Seq Region</dt>
          <dd>{genomeFragmentEntity.seqRegion ? genomeFragmentEntity.seqRegion.name : ''}</dd>
          <dt>Transcript</dt>
          <dd>{genomeFragmentEntity.transcript ? genomeFragmentEntity.transcript.id : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={genomeFragmentEntity.id}
          entityType={ENTITY_TYPE.GENOME_FRAGMENT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ genomeFragmentStore }: IRootStore) => ({
  genomeFragmentEntity: genomeFragmentStore.entity,
  getEntity: genomeFragmentStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomeFragmentDetail);
