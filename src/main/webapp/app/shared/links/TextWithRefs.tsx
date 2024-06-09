import { ParsedRef, parseReferences } from 'app/oncokb-commons/components/RefComponent';
import React from 'react';
import { findAndSplitReferenceInString } from '../util/utils';
import { REFERENCE_IDENTIFIERS } from 'app/config/constants/constants';

export interface ITextWithRefsProps {
  content: string;
}

export default function TextWithRefs({ content }: ITextWithRefsProps) {
  const result: JSX.Element[] = [];
  const parts = findAndSplitReferenceInString(content);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (REFERENCE_IDENTIFIERS.find(identifier => part.substring(1, identifier.length) === identifier)) {
      const parsedRefs = parseReferences(part, true);
      for (const parsedRef of parsedRefs) {
        if (parsedRef.link) {
          result.push(formatReferences([parsedRef]));
        } else {
          result.push(<span>{parsedRef.content}</span>);
        }
      }
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
