import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import React from 'react';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface IFdaLevelIcon {
  level: FDA_LEVEL_KEYS;
}

export const FdaLevelIcon = (props: IFdaLevelIcon) => {
  return (
    <span className={classNames('fa-layers fa-fw')} style={{ fontSize: '18px' }}>
      <FontAwesomeIcon icon={farCircle} />
      <span className="font-weight-bold" style={{ position: 'absolute', left: 8, fontSize: '12px' }}>
        {props.level.toString().replace('Fda', '')}
      </span>
    </span>
  );
};
