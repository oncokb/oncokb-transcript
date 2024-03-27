import React from 'react';
import _ from 'lodash';
import { parseTextForReferences } from '../util/utils';
import PubMedArticleTooltip from 'app/shared/tooltip/PubMedArticleTooltip';

interface IAutoParseRefField {
  summary: string;
}

export const AutoParseRefField: React.FunctionComponent<IAutoParseRefField> = props => {
  const content = parseTextForReferences(props.summary);

  return content.length > 0 ? (
    <div className={'d-flex flex-wrap'}>
      <span>References:</span>
      {content.map(c => {
        let ref = (
          <span className="ml-2" key={c.content}>
            <a target="_blank" rel="noopener noreferrer" href={c.link} style={{ whiteSpace: 'nowrap' }}>
              {`${c.prefix}${c.content}`}
            </a>
          </span>
        );
        if (c.prefix === 'PMID: ') {
          ref = (
            <PubMedArticleTooltip pmid={c.content} key={c.content}>
              {ref}
            </PubMedArticleTooltip>
          );
        }
        return ref;
      })}
    </div>
  ) : (
    <></>
  );
};
