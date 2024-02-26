import React, { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { PRIMARY } from 'app/config/colors';
import DefaultTooltip, { DefaultTooltipProps } from '../tooltip/DefaultTooltip';
import { CircleIcon } from './CircleIcon';

type SpanProps = JSX.IntrinsicElements['span'];

export interface IActionIcon extends SpanProps {
  icon: IconDefinition;
  compact?: boolean;
  size?: 'sm' | 'lg';
  color?: string;
  tooltipProps?: Omit<DefaultTooltipProps, 'children'>; // Omit children because that will be supplied by ActionIcon component
}

const ActionIcon: React.FunctionComponent<IActionIcon> = (props: IActionIcon) => {
  const { icon, compact, size, color, className, onMouseLeave, onMouseEnter, tooltipProps, ...rest } = props;
  const defaultCompact = compact || false;
  const fontSize = size === 'lg' ? '1.5.rem' : '1.2rem';
  const defaultColor = color || PRIMARY;
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
    cursor: 'pointer',
  };

  const [hover, setHover] = React.useState(false);
  const iconComponent = defaultCompact ? (
    <span {...rest} style={containerStyle}>
      <FontAwesomeIcon icon={icon} color={defaultColor} />
    </span>
  ) : (
    <CircleIcon
      solid={hover}
      innerIcon={icon}
      innerIconColor={hover ? 'white' : defaultColor}
      circleIconColor={defaultColor}
      iconStyle={iconStyle}
      containerClassNames={classNames(className)}
      containerStyle={containerStyle}
      onMouseEnter={e => {
        setHover(true);
        if (onMouseEnter) {
          onMouseEnter(e);
        }
      }}
      onMouseLeave={e => {
        setHover(false);
        if (onMouseLeave) {
          onMouseLeave(e);
        }
      }}
    />
  );
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
