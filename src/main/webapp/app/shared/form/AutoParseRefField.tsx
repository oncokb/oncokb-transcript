import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import React from 'react';
import WithSeparator from 'react-with-separator';
import { InlineDivider } from '../links/PubmedGeneArticlesLink';
import _ from 'lodash';

interface IAutoParseRefField {
  summary: string;
}

/* eslint-disable @typescript-eslint/prefer-regexp-exec */
export const AutoParseRefField: React.FunctionComponent<IAutoParseRefField> = props => {
  let content: Array<ParsedRef> = [];

  const regex = /(\(.*?[PMID|NCT|Abstract].*?\))/i;

  const parts = props.summary.split(regex);
  parts.forEach((part: string) => {
    if (part.match(regex)) {
      const parsedRef = parseReferences(part, true);
      parsedRef.filter(ref => ref.link).forEach(ref => content.push(ref));
    }
  });

  content = _.uniqBy(content, 'content');

  return (
    <div className={'d-flex flex-wrap'}>
      <span>References:</span>
      {content.map(c => (
        <span className="ml-2" key={c.content}>
          <a target="_blank" rel="noopener noreferrer" href={c.link} style={{ whiteSpace: 'nowrap' }}>
            {`${c.prefix}${c.content}`}
          </a>
        </span>
      ))}
    </div>
  );
};
