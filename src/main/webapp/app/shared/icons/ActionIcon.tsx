import React, { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { PRIMARY, SECONDARY } from 'app/config/colors';
import DefaultTooltip, { DefaultTooltipProps } from '../tooltip/DefaultTooltip';
import { CircleIcon } from './CircleIcon';

export type SpanProps = JSX.IntrinsicElements['span'];

export interface IActionIcon extends SpanProps {
  icon: IconDefinition;
  text?: string;
  compact?: boolean;
  size?: 'sm' | 'lg';
  color?: string;
  disabled?: boolean;
  tooltipProps?: Omit<DefaultTooltipProps, 'children'> | null; // Omit children because that will be supplied by ActionIcon component
}

const ActionIcon: React.FunctionComponent<IActionIcon> = (props: IActionIcon) => {
  const { icon, compact, size, color, className, onMouseLeave, onMouseEnter, tooltipProps, text, ...rest } = props;
  const defaultCompact = compact || false;
  const fontSize = size === 'lg' ? '1.5rem' : '1.2rem';
  const defaultColor = props.disabled ? SECONDARY : color || PRIMARY;
  const iconStyle: CSSProperties = {
    position: 'absolute',
    transition: 'opacity 0.2s ease',
    fontSize,
  };
  const containerStyle: CSSProperties = {
    fontSize,
    width: fontSize,
    display: 'inline-block',
    position: 'relative',
    cursor: props.disabled ? 'default' : 'pointer',
  };

  const [hover, setHover] = React.useState(false);

  const handleMouseEnter = e => {
    if (!props.disabled) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = e => {
    if (!props.disabled) {
      setHover(false);
    }
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  const handleClick = e => {
    if (!props.disabled) {
      props.onClick?.(e);
    }
  };

  let iconComponent = defaultCompact ? (
    <span {...rest} style={containerStyle}>
      <FontAwesomeIcon icon={icon} color={defaultColor} />
    </span>
  ) : (
    <CircleIcon
      {...rest}
      solid={hover}
      innerIcon={icon}
      innerIconColor={hover ? 'white' : defaultColor}
      circleIconColor={defaultColor}
      iconStyle={iconStyle}
      containerClassNames={classNames(className)}
      containerStyle={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );

  if (text) {
    iconComponent = (
      <div className="d-flex align-items-center">
        {iconComponent}

        {text ? <span className="ms-1">{text}</span> : undefined}
      </div>
    );
  }

  if (!tooltipProps) {
    return iconComponent;
  }
  return (
    <DefaultTooltip {...tooltipProps} placement="top">
      {iconComponent}
    </DefaultTooltip>
  );
};
export default ActionIcon;
