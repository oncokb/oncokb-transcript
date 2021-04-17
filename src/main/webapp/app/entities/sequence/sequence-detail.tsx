import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './sequence.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ISequenceDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const SequenceDetail = (props: ISequenceDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { sequenceEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="sequenceDetailsHeading">Sequence</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{sequenceEntity.id}</dd>
          <dt>
            <span id="sequenceType">Sequence Type</span>
          </dt>
          <dd>{sequenceEntity.sequenceType}</dd>
          <dt>
            <span id="sequence">Sequence</span>
          </dt>
          <dd>{sequenceEntity.sequence}</dd>
          <dt>Transcript</dt>
          <dd>{sequenceEntity.transcript ? sequenceEntity.transcript.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/sequence" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/sequence/${sequenceEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ sequence }: IRootState) => ({
  sequenceEntity: sequence.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(SequenceDetail);
