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
    <div>
      <span>References:</span>
      <span className="ml-2">
        <WithSeparator separator={InlineDivider}>
          {content.map(c => (
            <a target="_blank" rel="noopener noreferrer" href={c.link} key={c.content} style={{ whiteSpace: 'nowrap' }}>
              {`${c.prefix}${c.content}`}
            </a>
          ))}
        </WithSeparator>
      </span>
    </div>
  );
};
