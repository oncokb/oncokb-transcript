import React from 'react';
import WithSeparator from 'react-with-separator';

export interface IPMIDLinkProps {
  pmids: string;
  separateLinks?: boolean;
  separator?: JSX.Element | string;
}

export const PMIDLink: React.FunctionComponent<IPMIDLinkProps> = props => {
  if (props.separateLinks) {
    <WithSeparator separator={props.separator ?? ''}>
      {props.pmids.split(',').map(pmid => (
        <span key={pmid}>
          PMID:{' '}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/?term=${pmid}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ whiteSpace: 'nowrap' }}
          >
            {pmid}
          </a>
        </span>
      ))}
    </WithSeparator>;
  }
  return (
    <span>
      PMID:{' '}
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/?term=${props.pmids.split(/[ |,]/g).join(' ')}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ whiteSpace: 'nowrap' }}
      >
        {props.pmids}
      </a>
    </span>
  );
};
