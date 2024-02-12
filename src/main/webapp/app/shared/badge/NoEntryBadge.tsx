import React from 'react';
import classNames from 'classnames';

const NoEntryBadge: React.FunctionComponent<React.HTMLAttributes<HTMLSpanElement>> = props => {
  const { className, style, ...rest } = props;
  return (
    <span className={classNames(`badge badge-pill badge-info mx-1`, className)} style={{ fontSize: '0.6rem', ...style }} {...rest}>
      No entry
    </span>
  );
};

export default NoEntryBadge;
