import React from 'react';
import WithSeparator from 'react-with-separator';

export interface IPMIDLinkProps {
  pmids: string;
  seperateLinks?: boolean;
  seperator?: JSX.Element | string;
}

export const PMIDLink: React.FunctionComponent<IPMIDLinkProps> = props => {
  if (props.seperateLinks) {
    <WithSeparator separator={props.seperator}>
      {props.pmids.split(',').map(pmid => (
        <span>
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
