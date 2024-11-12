import { REFERENCE_GENOME } from 'app/config/constants/constants';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import React from 'react';

const EnsemblIdLinkout: React.FunctionComponent<{
  ensemblId: string;
  referenceGenome: REFERENCE_GENOME;
  className?: string;
}> = props => {
  return (
    <ExternalLinkIcon
      link={`https://${props.referenceGenome === REFERENCE_GENOME.GRCH37 ? 'grch37' : 'www'}.ensembl.org/id/${props.ensemblId}`}
      className={props.className}
    >
      {props.children ? props.children : props.ensemblId}
    </ExternalLinkIcon>
  );
};

export default EnsemblIdLinkout;
