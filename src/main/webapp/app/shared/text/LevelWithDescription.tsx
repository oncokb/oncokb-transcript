import React from 'react';
import { LEVELS, ONCOKB_LEVELS } from '../util/firebase/firebase-level-utils';
import { ALL_LEVEL_DESCRIPTIONS, FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { FdaLevelIcon } from '../icons/FdaLevelIcon';
import { TX_LEVELS } from '../model/firebase/firebase.model';
import { OncoKBIcon } from '../icons/OncoKBIcon';

export interface ILevelWithDescriptionProps {
  level: LEVELS;
}

export const LevelWithDescription = (props: ILevelWithDescriptionProps) => {
  let levelIcon = <OncoKBIcon iconType="level" value={props.level as ONCOKB_LEVELS} />;
  if (Object.values(FDA_LEVEL_KEYS).includes(props.level as FDA_LEVEL_KEYS)) {
    levelIcon = <FdaLevelIcon level={props.level as FDA_LEVEL_KEYS} />;
  }
  if (props.level === FDA_LEVEL_KEYS.LEVEL_FDA_NO || props.level === TX_LEVELS.LEVEL_NO || props.level === TX_LEVELS.LEVEL_EMPTY) {
    levelIcon = <></>;
  }
  return (
    <div className="d-flex align-items-center">
      {levelIcon}
      <span className="ms-2" style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
        {' '}
        {ALL_LEVEL_DESCRIPTIONS[props.level]}
      </span>
    </div>
  );
};
