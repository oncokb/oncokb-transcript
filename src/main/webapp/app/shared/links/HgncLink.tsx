import React from 'react';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';

export const HgncLink: React.FunctionComponent<{ id: string }> = props => {
  return (
    <ExternalLinkIcon link={`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:${props.id}`}>
      <span>HGNC: {props.id}</span>
    </ExternalLinkIcon>
  );
};
