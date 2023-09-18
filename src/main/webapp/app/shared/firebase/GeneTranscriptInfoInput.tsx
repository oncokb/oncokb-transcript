import React from 'react';
import { Row, Col } from 'reactstrap';
import { REFERENCE_GENOME } from 'app/config/constants';
import { RealtimeBasicInput, RealtimeInputType } from 'app/shared/firebase/FirebaseRealtimeInput';

const GeneTranscriptInfoInput: React.FunctionComponent<{
  referenceGenome: REFERENCE_GENOME;
  isoform: string;
  refseq: string;
  onIsoformChange: (event) => void;
  onRefseqChange: (event) => void;
}> = props => {
  return (
    <Row>
      <Col>
        <RealtimeBasicInput
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          type={RealtimeInputType.TEXT}
          labelClass="font-weight-bold"
          inputClass="h-25 p-1"
          value={props.isoform || ''}
          onChange={props.onIsoformChange}
        />
      </Col>
      <Col>
        <RealtimeBasicInput
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          type={RealtimeInputType.TEXT}
          labelClass="font-weight-bold"
          inputClass="h-25 p-1"
          value={props.refseq || ''}
          onChange={props.onRefseqChange}
        />
      </Col>
    </Row>
  );
};

export default GeneTranscriptInfoInput;
