import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircle as fasCircle } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import React, { CSSProperties } from 'react';

export interface ICircleIconProps {
  innerIcon: IconDefinition;
  solid?: boolean;
  containerClassNames?: string;
  containerStyle?: CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLSpanElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>;
  iconStyle?: CSSProperties;
  circleIconColor?: string;
  innerIconColor?: string;
}

export const CircleIcon: React.FunctionComponent<ICircleIconProps> = ({
  innerIcon,
  solid,
  circleIconColor,
  innerIconColor,
  containerStyle,
  containerClassNames,
  onMouseEnter,
  onMouseLeave,
  iconStyle,
}: ICircleIconProps) => {
  return (
    <span
      className={classNames('fa-layers fa-fw', containerClassNames)}
      style={{ ...containerStyle }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {solid ? (
        <FontAwesomeIcon icon={fasCircle} color={circleIconColor} style={{ ...iconStyle }} />
      ) : (
        <FontAwesomeIcon icon={farCircle} color={circleIconColor} style={{ ...iconStyle }} />
      )}
      <FontAwesomeIcon icon={innerIcon} color={innerIconColor} transform="shrink-9" />
    </span>
  );
};
