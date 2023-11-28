import React from 'react';
import './count-badge.scss';
import classNames from 'classnames';

export interface CountBadgeProps {
  base: string | JSX.Element;
  count: number;
  hideWhenOne?: boolean;
  max?: number;
}

const CountBadge = (props: CountBadgeProps) => {
  const count = props.count > (props.max || Number.MAX_SAFE_INTEGER) ? `${props.max}+` : props.count;
  const hideWhenOne = props.hideWhenOne !== undefined ? props.hideWhenOne : false;

  return (
    <div className="mr-1">
      <div className={classNames('pt-2', hideWhenOne ? 'pr-0' : 'pr-2', 'count-badge-wrapper')}>
        <span className="font-weight-bold">{props.base}</span>
        {hideWhenOne ? undefined : (
          <span className="count-badge">
            <span className="badge rounded-pill bg-info text-white count-badge-content">{count}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default CountBadge;
