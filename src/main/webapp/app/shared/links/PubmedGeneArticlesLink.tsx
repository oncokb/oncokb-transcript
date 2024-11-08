import React from 'react';
import WithSeparator from 'react-with-separator';

export const InlineDivider = <div className="mx-2 my-1" style={{ borderLeft: '1px solid grey' }}></div>;

export const PubmedGeneArticlesLink: React.FunctionComponent<{ hugoSymbols: string[] }> = props => {
  return (
    <WithSeparator separator={InlineDivider}>
      {props.hugoSymbols.map(gene => {
        return (
          <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${gene}`} target="_blank" rel="noopener noreferrer" key={gene}>
            {gene}
          </a>
        );
      })}
    </WithSeparator>
  );
};
