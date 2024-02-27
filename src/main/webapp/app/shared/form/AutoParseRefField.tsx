import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import React from 'react';
import WithSeparator from 'react-with-separator';
import { InlineDivider } from '../links/PubmedGeneArticlesLink';
import _ from 'lodash';
import { REFERENCE_LINK_REGEX } from 'app/config/constants/constants';

interface IAutoParseRefField {
  summary: string;
}

/* eslint-disable @typescript-eslint/prefer-regexp-exec */
export const AutoParseRefField: React.FunctionComponent<IAutoParseRefField> = props => {
  let content: Array<ParsedRef> = [];

  const parts = props.summary.split(REFERENCE_LINK_REGEX);
  parts.forEach((part: string) => {
    if (part.match(REFERENCE_LINK_REGEX)) {
      const parsedRef = parseReferences(part, true);
      parsedRef.filter(ref => ref.link).forEach(ref => content.push(ref));
    }
  });

  content = _.uniqBy(content, 'content');

  return content.length > 0 ? (
    <div className={'d-flex flex-wrap'}>
      <span>References:</span>
      {content.map(c => (
        <span className="ml-2" key={c.content}>
          <a target="_blank" rel="noopener noreferrer" href={c.link} style={{ whiteSpace: 'nowrap', textDecoration: 'underline' }}>
            {`${c.prefix}${c.content}`}
          </a>
        </span>
      ))}
    </div>
  ) : (
    <></>
  );
};
