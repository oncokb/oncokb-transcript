import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import React from 'react';
import WithSeparator from 'react-with-separator';
import { InlineDivider } from '../links/PubmedGeneArticlesLink';
import _ from 'lodash';
import { parseTextForReferences } from '../util/utils';
import { REFERENCE_LINK_REGEX } from 'app/config/constants/constants';

interface IAutoParseRefField {
  summary: string;
}

export const AutoParseRefField: React.FunctionComponent<IAutoParseRefField> = props => {
  const content = parseTextForReferences(props.summary);

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
