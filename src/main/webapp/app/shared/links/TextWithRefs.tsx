import { REFERENCE_LINK_REGEX } from 'app/config/constants/constants';
import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import React from 'react';

export interface ITextWithRefsProps {
  content: string;
}

export default function TextWithRefs({ content }: ITextWithRefsProps) {
  const result: JSX.Element[] = [];
  const parts = content?.split(REFERENCE_LINK_REGEX) || [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (REFERENCE_LINK_REGEX.exec(part)) {
      const refs = parseReferences(part, true);
      result.push(formatReferences(refs));
    } else {
      result.push(<span key={i}>{part}</span>);
    }
  }

  return <span>{result}</span>;
}

function formatReferences(refs: ParsedRef[]) {
  const prefix = refs[0].prefix;
  const joinedReferences = refs.map((ref, index) => {
    return (
      <span key={index}>
        <a style={{ textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" href={ref.link}>
          {`${prefix}${ref.content}`}
        </a>
        {index !== refs.length - 1 ? ', ' : null}
      </span>
    );
  });

  return (
    <span>
      {'('}
      {joinedReferences}
      {')'}
    </span>
  );
}
