import * as React from 'react';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import { TooltipProps } from 'rc-tooltip/es/Tooltip';
import './styles.scss';

export const TOOLTIP_MOUSE_ENTER_DELAY_MS = 0.5;

export interface DefaultTooltipProps extends TooltipProps {
  disabled?: boolean;
  getTooltipContainer?: () => HTMLElement;
  children: any;
}

const defaultProps = {
  mouseEnterDelay: TOOLTIP_MOUSE_ENTER_DELAY_MS,
  mouseLeaveDelay: 0.05,
  arrowContent: <div className="rc-tooltip-arrow-inner" />,
};

export const DefaultTooltip: React.FunctionComponent<DefaultTooltipProps> = ({
  mouseEnterDelay = defaultProps.mouseEnterDelay,
  mouseLeaveDelay = defaultProps.mouseLeaveDelay,
  arrowContent = defaultProps.arrowContent,
  ...props
}) => {
  const { disabled, onPopupAlign, ...restProps } = props;
  let { visible } = props;
  const tooltipProps: TooltipProps = { ...restProps, mouseEnterDelay, mouseLeaveDelay, arrowContent };
  if (disabled) {
    visible = false;
  }
  if (typeof visible !== 'undefined') {
    tooltipProps.visible = visible;
  }
  return <Tooltip {...tooltipProps}>{props.children}</Tooltip>;
};

export default DefaultTooltip;
