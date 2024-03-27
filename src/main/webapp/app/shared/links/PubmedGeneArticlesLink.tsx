import React from 'react';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import WithSeparator from 'react-with-separator';

export const InlineDivider = <span className="ml-2"></span>;

export const PubmedGeneArticlesLink: React.FunctionComponent<{ hugoSymbols: string[] }> = props => {
  return (
    <WithSeparator separator={InlineDivider}>
      {props.hugoSymbols.map(gene => {
        return (
          <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${gene}`} target="_blank" rel="noopener noreferrer" key={gene}>
            {gene} <ExternalLinkIcon />
          </a>
        );
      })}
    </WithSeparator>
  );
};
