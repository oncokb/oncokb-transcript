import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IEvidenceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EvidenceDetail = (props: IEvidenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const evidenceEntity = props.evidenceEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="evidenceDetailsHeading">Evidence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{evidenceEntity.id}</dd>
          <dt>
            <span id="uuid">Uuid</span>
          </dt>
          <dd>{evidenceEntity.uuid}</dd>
          <dt>
            <span id="evidenceType">Evidence Type</span>
          </dt>
          <dd>{evidenceEntity.evidenceType}</dd>
          <dt>
            <span id="knownEffect">Known Effect</span>
          </dt>
          <dd>{evidenceEntity.knownEffect}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{evidenceEntity.description}</dd>
          <dt>
            <span id="note">Note</span>
          </dt>
          <dd>{evidenceEntity.note}</dd>
          <dt>Association</dt>
          <dd>{evidenceEntity.association ? evidenceEntity.association.id : ''}</dd>
          <dt>Level Of Evidence</dt>
          <dd>
            {evidenceEntity.levelOfEvidences
              ? evidenceEntity.levelOfEvidences.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {evidenceEntity.levelOfEvidences && i === evidenceEntity.levelOfEvidences.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={evidenceEntity.id}
          entityType={ENTITY_TYPE.TRANSCRIPT}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ evidenceStore }: IRootStore) => ({
  evidenceEntity: evidenceStore.entity,
  getEntity: evidenceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EvidenceDetail);
