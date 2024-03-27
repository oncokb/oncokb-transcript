import React from 'react';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';

export const HgncLink: React.FunctionComponent<{ id: string }> = props => {
  return (
    <a href={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:${props.id}`} target="_blank" rel="noopener noreferrer">
      {props.id} <ExternalLinkIcon />
    </a>
  );
};
