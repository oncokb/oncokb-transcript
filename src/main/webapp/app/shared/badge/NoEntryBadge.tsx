import React from 'react';
import DefaultBadge from './DefaultBadge';

const NoEntryBadge: React.FunctionComponent<React.HTMLAttributes<HTMLSpanElement>> = props => {
  return (
    <DefaultBadge color={'info'} {...props}>
      No Entry
    </DefaultBadge>
  );
};

export default NoEntryBadge;
