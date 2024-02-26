import React from 'react';
import classNames from 'classnames';
import DefaultTooltip from '../tooltip/DefaultTooltip';

export interface IDefaultBadgeProps {
  color: string;
  text: string;
  tooltipOverlay?: (() => React.ReactNode) | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DefaultBadge: React.FunctionComponent<IDefaultBadgeProps> = props => {
  const { className, style, color, text, tooltipOverlay } = props;

  const badge = (
    <span className={classNames(`badge badge-pill badge-${color} mx-1`, className)} style={{ fontSize: '0.6rem', ...style }}>
      {text}
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
    <span className={classNames(`badge badge-pill badge-${color} mx-1`, className)} style={{ fontSize: '0.6rem', ...style }}>
      {text}
    </span>
  );
};

export default DefaultBadge;
