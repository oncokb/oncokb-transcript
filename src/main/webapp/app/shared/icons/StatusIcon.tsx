import React from 'react';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleInfo, faInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { DANGER, PRIMARY, SUCCESS, WARNING } from 'app/config/colors';

export type IconType = 'message' | 'tooltip';
export type Status = 'success' | 'fail' | 'warning';

const StatusIcon: React.FunctionComponent<{
  status: Status;
  type?: IconType;
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}> = props => {
  function getIcon() {
    let icon = faCircleInfo;
    let color = PRIMARY;
    switch (props.status) {
      case 'success':
        icon = faCircleCheck;
        color = SUCCESS;
        break;
      case 'warning':
        icon = faTriangleExclamation;
        color = WARNING;
        break;
      case 'fail':
        icon = faTriangleExclamation;
        color = DANGER;
        break;
      default:
        // default has been initialized before switch
        break;
    }
    const style = {
      ...props.style,
      color,
    };
    return <FontAwesomeIcon icon={icon} className={classNames(props.className)} style={style} />;
  }

  return (
    <DefaultTooltip overlay={props.type === 'tooltip' ? props.message : null} disabled={props.type !== 'tooltip'}>
      <div>
        {getIcon()}
        {props.type === 'message' && <span className={'ms-2'}>{props.message}</span>}
      </div>
    </DefaultTooltip>
  );
};
export default StatusIcon;
