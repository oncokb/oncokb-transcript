import React from 'react';
import { Row, Col } from 'reactstrap';
import { REFERENCE_GENOME } from 'app/config/constants';
import { RealtimeInputType, RealtimeTextInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import RealtimeBasicInput from './RealtimeBasicInput';

const GeneTranscriptInfoInput: React.FunctionComponent<{
  referenceGenome: REFERENCE_GENOME;
}> = props => {
  return (
    <Row>
      <Col>
        <RealtimeTextInput
          fieldKey={props.referenceGenome === REFERENCE_GENOME.GRCH37 ? 'isoform_override' : 'isoform_override_grch38'}
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          inputClass="h-25 p-1"
        />
      </Col>
      <Col>
        <RealtimeBasicInput
          fieldKey={props.referenceGenome === REFERENCE_GENOME.GRCH37 ? 'dmp_refseq_id' : 'dmp_refseq_id_grch38'}
          name={`isoform-${props.referenceGenome}`}
          label={`${props.referenceGenome} Isoform`}
          type={RealtimeInputType.TEXT}
          inputClass="h-25 p-1"
        />
      </Col>
    </Row>
  );
};

export default GeneTranscriptInfoInput;
