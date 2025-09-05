import React from 'react';
import classNames from 'classnames';
import DefaultTooltip from '../tooltip/DefaultTooltip';

export interface IDefaultBadgeProps {
  color: string;
  text: string;
  tooltipOverlay?: (() => React.ReactNode) | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isRoundedPill?: boolean;
  onDeleteCallback?: () => void;
}

const DefaultBadge: React.FunctionComponent<IDefaultBadgeProps> = props => {
  const { className, style, color, text, tooltipOverlay, isRoundedPill = true } = props;

  const badgeClassNames = ['badge', 'mx-1', `text-bg-${color}`];
  if (isRoundedPill) badgeClassNames.push('rounded-pill');

  const badge = (
    <span className={classNames(badgeClassNames.join(' '), className)} style={{ fontSize: '0.8rem', ...style }}>
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

  return badge;
};

export default DefaultBadge;
