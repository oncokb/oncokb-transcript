import React from 'react';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { CircleIcon } from './CircleIcon';

type IconType = 'info' | 'question';
const InfoIcon: React.FunctionComponent<{
  overlay?: (() => React.ReactChild) | React.ReactChild | React.ReactFragment | React.ReactPortal;
  overlayClassName?: string;
  placement?: string;
  style?: React.CSSProperties;
  type?: IconType;
  className?: string;
}> = props => {
  function getIcon() {
    const style = {
      ...props.style,
    };
    switch (props.type) {
      case 'question':
        return <FontAwesomeIcon icon={faQuestionCircle} style={style} />;
      case 'info':
      default:
        return <CircleIcon innerIcon={faInfo} containerClassNames={classNames(props.className)} containerStyle={{ ...style }} />;
    }
  }

  return (
    <DefaultTooltip
      overlay={props.overlay ? props.overlay : <span></span>}
      overlayClassName={props.overlayClassName}
      placement={props.placement}
      disabled={!props.overlay}
    >
      {getIcon()}
    </DefaultTooltip>
  );
};
export default InfoIcon;
