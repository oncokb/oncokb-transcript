import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface ILevelOfEvidenceDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const LevelOfEvidenceDetail = (props: ILevelOfEvidenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const levelOfEvidenceEntity = props.levelOfEvidenceEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="levelOfEvidenceDetailsHeading">LevelOfEvidence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{levelOfEvidenceEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{levelOfEvidenceEntity.type}</dd>
          <dt>
            <span id="level">Level</span>
          </dt>
          <dd>{levelOfEvidenceEntity.level}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{levelOfEvidenceEntity.description}</dd>
          <dt>
            <span id="htmlDescription">Html Description</span>
          </dt>
          <dd>{levelOfEvidenceEntity.htmlDescription}</dd>
          <dt>
            <span id="color">Color</span>
          </dt>
          <dd>{levelOfEvidenceEntity.color}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={levelOfEvidenceEntity.id}
          entityType={ENTITY_TYPE.LEVEL_OF_EVIDENCE}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ levelOfEvidenceStore }: IRootStore) => ({
  levelOfEvidenceEntity: levelOfEvidenceStore.entity,
  getEntity: levelOfEvidenceStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(LevelOfEvidenceDetail);
