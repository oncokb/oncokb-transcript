import React from 'react';
import InfoIcon from './InfoIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { DANGER, WARNING } from 'app/config/colors';

export const VusRecencyInfoIcon = props => {
  const overlay = (
    <>
      <div>
        <FontAwesomeIcon className="mr-2" icon={faCircle} color={WARNING} size="sm" />
        <span>{'More than 3 months old'}</span>
      </div>
      <div>
        <FontAwesomeIcon className="mr-2" icon={faCircle} color={DANGER} size="sm" />
        <span>{'More than 6 months old'}</span>
      </div>
    </>
  );
  return <InfoIcon type="info" overlay={overlay} className="ml-2" />;
};
