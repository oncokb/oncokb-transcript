import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
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
        <Button tag={Link} to="/evidence" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/evidence/${evidenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
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
