import React from 'react';
import DefaultBadge from './DefaultBadge';

const NoEntryBadge: React.FunctionComponent<React.HTMLAttributes<HTMLSpanElement>> = props => {
  return <DefaultBadge color={'info'} text={'No entry'} {...props} />;
};

export default NoEntryBadge;
