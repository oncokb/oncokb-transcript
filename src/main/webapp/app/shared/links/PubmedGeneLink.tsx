import React from 'react';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';

export const PubmedGeneLink: React.FunctionComponent<{ entrezGeneId: string | number }> = props => {
  return (
    <ExternalLinkIcon link={`https://www.ncbi.nlm.nih.gov/gene/${props.entrezGeneId}`}>
      <span>NCBI: {props.entrezGeneId}</span>
    </ExternalLinkIcon>
  );
};
