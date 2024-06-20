import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import {} from 'react-jhipster';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IAlterationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationDetail = (props: IAlterationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const alterationEntity = props.alterationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="alterationDetailsHeading">Alteration</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{alterationEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{alterationEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{alterationEntity.name}</dd>
          <dt>
            <span id="alteration">Alteration</span>
          </dt>
          <dd>{alterationEntity.alteration}</dd>
          <dt>
            <span id="proteinChange">Protein Change</span>
          </dt>
          <dd>{alterationEntity.proteinChange}</dd>
          <dt>
            <span id="start">Start</span>
          </dt>
          <dd>{alterationEntity.start}</dd>
          <dt>
            <span id="end">End</span>
          </dt>
          <dd>{alterationEntity.end}</dd>
          <dt>
            <span id="refResidues">Ref Residues</span>
          </dt>
          <dd>{alterationEntity.refResidues}</dd>
          <dt>
            <span id="variantResidues">Variant Residues</span>
          </dt>
          <dd>{alterationEntity.variantResidues}</dd>
          <dt>Gene</dt>
          <dd>
            {alterationEntity.genes
              ? alterationEntity.genes.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {alterationEntity.genes && i === alterationEntity.genes.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Transcript</dt>
          <dd>
            {alterationEntity.transcripts
              ? alterationEntity.transcripts.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {alterationEntity.transcripts && i === alterationEntity.transcripts.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Consequence</dt>
          <dd>{alterationEntity.consequence ? alterationEntity.consequence.term : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={alterationEntity.id}
          entityType={ENTITY_TYPE.ALTERATION}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  alterationEntity: alterationStore.entity,
  getEntity: alterationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IAlterationDetailProps, StoreProps>(mapStoreToProps)(AlterationDetail);
