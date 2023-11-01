import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        </dl>
        <Button tag={Link} to="/level-of-evidence" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/level-of-evidence/${levelOfEvidenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
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
