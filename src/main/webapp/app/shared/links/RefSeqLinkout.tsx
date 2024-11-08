import { REFERENCE_GENOME } from 'app/config/constants/constants';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import React from 'react';

const RefSeqLinkout: React.FunctionComponent<{
  refSeq: string;
  referenceGenome: REFERENCE_GENOME;
}> = props => {
  return (
    <ExternalLinkIcon link={`https://www.ncbi.nlm.nih.gov/nuccore/${props.refSeq}`}>
      {props.children ? props.children : props.refSeq}
    </ExternalLinkIcon>
  );
};

export default RefSeqLinkout;
