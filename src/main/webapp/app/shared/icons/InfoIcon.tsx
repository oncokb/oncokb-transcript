import React from 'react';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

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
        return (
          <span
            className={classNames('fa-layers fa-fw', props.className)}
            style={{
              fontSize: '1rem',
              ...style,
            }}
          >
            <FontAwesomeIcon icon={farCircle} />
            <FontAwesomeIcon icon={faInfo} transform="shrink-9" />
          </span>
        );
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
