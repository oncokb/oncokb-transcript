import React from 'react';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FDA_LEVELS } from '../model/firebase/firebase.model';

export interface IFdaLevelIcon {
  level: FDA_LEVELS;
}

export const FdaLevelIcon = (props: IFdaLevelIcon) => {
  return (
    <span className={classNames('fa-layers fa-fw')} style={{ fontSize: '18px' }}>
      <FontAwesomeIcon icon={farCircle} />
      <span className="fw-bold" style={{ position: 'absolute', left: 8, fontSize: '12px' }}>
        {props.level.toString().replace('Fda', '')}
      </span>
    </span>
  );
};
