import React from 'react';
import classNames from 'classnames';
import DefaultTooltip from '../tooltip/DefaultTooltip';

export interface IDefaultBadgeProps {
  color: string;
  children: React.ReactNode;
  tooltipOverlay?: (() => React.ReactNode) | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  square?: boolean;
}

const DefaultBadge: React.FunctionComponent<IDefaultBadgeProps> = props => {
  const { className, style, color, square, tooltipOverlay } = props;

  const badge = (
    <span
      className={classNames(`badge ${!square ? 'rounded-pill' : undefined} text-bg-${color} mx-1`, className)}
      style={{ fontSize: '0.7rem', ...style }}
    >
      {props.children}
    </span>
  );

  if (tooltipOverlay) {
    return (
      <DefaultTooltip placement="top" overlay={tooltipOverlay}>
        {badge}
      </DefaultTooltip>
    );
  }

  return (
    <span
      className={classNames(`badge ${!square ? 'rounded-pill' : undefined} text-bg-${color} mx-1`, className)}
      style={{ fontSize: '0.7rem', ...style }}
    >
      {props.children}
    </span>
  );
};

export default DefaultBadge;
