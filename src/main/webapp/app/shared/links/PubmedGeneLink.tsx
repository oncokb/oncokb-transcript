import React from 'react';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';

export const PubmedGeneLink: React.FunctionComponent<{ entrezGeneId: string | number }> = props => {
  return (
    <a href={`https://www.ncbi.nlm.nih.gov/gene/${props.entrezGeneId}`} target="_blank" rel="noopener noreferrer">
      {props.entrezGeneId} <ExternalLinkIcon />
    </a>
  );
};
