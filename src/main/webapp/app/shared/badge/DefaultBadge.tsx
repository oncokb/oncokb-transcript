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

  return (
    <DefaultTooltip placement="top" overlay={tooltipOverlay}>
      <span className={classNames(`badge badge-pill badge-${color} mx-1`, className)} style={{ fontSize: '0.6rem', ...style }}>
        {text}
      </span>
    </DefaultTooltip>
  );
};

export default DefaultBadge;
