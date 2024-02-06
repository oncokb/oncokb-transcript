import React, { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircle as fasCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { PRIMARY } from 'app/config/colors';

type SpanProps = JSX.IntrinsicElements['span'];

export interface IActionIcon extends SpanProps {
  icon: IconDefinition;
  compact?: boolean;
  size?: 'sm' | 'lg';
  color?: string;
}

const ActionIcon: React.FunctionComponent<IActionIcon> = (props: IActionIcon) => {
  const { icon, compact, size, color, className, onMouseLeave, onMouseEnter, ...rest } = props;
  const defaultCompact = compact || false;
  const fontSize = size === 'lg' ? 1.5 : 1.2;
  const defaultColor = color || PRIMARY;
  const iconStyle: CSSProperties = {
    position: 'absolute',
    transition: 'opacity 0.2s ease',
    fontSize: `${fontSize}rem`,
  };
  const containerStyle: CSSProperties = {
    fontSize: `${fontSize}rem`,
    width: `${fontSize}rem`,
    display: 'inline-block',
    position: 'relative',
    cursor: 'pointer',
  };

  const [hover, setHover] = React.useState(false);
  return defaultCompact ? (
    <span {...rest} style={containerStyle}>
      <FontAwesomeIcon icon={icon} color={defaultColor} />
    </span>
  ) : (
    <span
      {...rest}
      className={classNames('fa-layers fa-fw', className)}
      style={containerStyle}
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
    >
      <FontAwesomeIcon
        icon={farCircle}
        color={defaultColor}
        style={{ ...iconStyle, opacity: hover ? 0 : 1 }} // Regular circle becomes transparent on hover
      />
      <FontAwesomeIcon
        icon={fasCircle}
        color={defaultColor}
        style={{ ...iconStyle, opacity: hover ? 1 : 0 }} // Solid circle appears on hover
      />
      <FontAwesomeIcon
        icon={icon}
        color={hover ? 'white' : defaultColor}
        transform="shrink-9"
        style={{ ...iconStyle, opacity: 1 }} // Check icon always visible
      />
    </span>
  );
};
export default ActionIcon;
