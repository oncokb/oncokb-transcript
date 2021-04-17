import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './transcript-usage.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITranscriptUsageDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TranscriptUsageDetail = (props: ITranscriptUsageDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { transcriptUsageEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="transcriptUsageDetailsHeading">
          TranscriptUsage [<strong>{transcriptUsageEntity.id}</strong>]
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="source">Source</span>
          </dt>
          <dd>{transcriptUsageEntity.source}</dd>
          <dt>Transcript</dt>
          <dd>{transcriptUsageEntity.transcript ? transcriptUsageEntity.transcript.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/transcript-usage" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/transcript-usage/${transcriptUsageEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ transcriptUsage }: IRootState) => ({
  transcriptUsageEntity: transcriptUsage.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptUsageDetail);
