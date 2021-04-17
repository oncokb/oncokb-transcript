import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './transcript.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITranscriptDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TranscriptDetail = (props: ITranscriptDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { transcriptEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="transcriptDetailsHeading">
          Transcript [<strong>{transcriptEntity.id}</strong>]
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="entrezGeneId">Entrez Gene Id</span>
          </dt>
          <dd>{transcriptEntity.entrezGeneId}</dd>
          <dt>
            <span id="hugoSymbol">Hugo Symbol</span>
          </dt>
          <dd>{transcriptEntity.hugoSymbol}</dd>
          <dt>
            <span id="referenceGenome">Reference Genome</span>
          </dt>
          <dd>{transcriptEntity.referenceGenome}</dd>
          <dt>
            <span id="ensemblTranscriptId">Ensembl Transcript Id</span>
          </dt>
          <dd>{transcriptEntity.ensemblTranscriptId}</dd>
          <dt>
            <span id="ensemblProteinId">Ensembl Protein Id</span>
          </dt>
          <dd>{transcriptEntity.ensemblProteinId}</dd>
          <dt>
            <span id="referenceSequenceId">Reference Sequence Id</span>
          </dt>
          <dd>{transcriptEntity.referenceSequenceId}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{transcriptEntity.description}</dd>
        </dl>
        <Button tag={Link} to="/transcript" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/transcript/${transcriptEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ transcript }: IRootState) => ({
  transcriptEntity: transcript.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptDetail);
