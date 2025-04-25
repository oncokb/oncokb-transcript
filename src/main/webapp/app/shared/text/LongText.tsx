import * as React from 'react';
import { useState } from 'react';
import './long-text.scss';
import classnames from 'classnames';
import { LONG_TEXT_CUTOFF } from 'app/config/constants/constants';
import { shortenTextByCharacters } from '../util/utils';

export const LongText: React.FunctionComponent<{
  text: string;
  cutoff?: number;
}> = props => {
  const propText = (props.text || '').trim();
  const cutoff = props.cutoff || LONG_TEXT_CUTOFF;
  const [expandedText, setExpandedText] = useState(false);
  const text = expandedText ? propText : shortenTextByCharacters(propText, cutoff);
  return (
    <div>
      <span>{text}</span>
      {expandedText || text.length === propText.length ? undefined : (
        <>
          <span className={'mx-2'}>...</span>
          <span className={'linkOutText'} onClick={() => setExpandedText(true)}>
            Show more
          </span>
        </>
      )}
      {!expandedText ? undefined : (
        <>
          <span className={classnames('linkOutText', 'mx-2')} onClick={() => setExpandedText(false)}>
            Show less
          </span>
        </>
      )}
    </div>
  );
};
