import React from 'react';
import { LEVELS, ONCOKB_LEVELS } from '../util/firebase/firebase-level-utils';
import { ALL_LEVEL_DESCRIPTIONS } from 'app/config/constants/firebase';
import { FdaLevelIcon } from '../icons/FdaLevelIcon';
import { FDA_LEVELS, TX_LEVELS } from '../model/firebase/firebase.model';
import { OncoKBIcon } from '../icons/OncoKBIcon';

export interface ILevelWithDescriptionProps {
  level: LEVELS;
}

export const LevelWithDescription = (props: ILevelWithDescriptionProps) => {
  let levelIcon = <OncoKBIcon iconType="level" value={props.level as ONCOKB_LEVELS} />;
  if (Object.values(FDA_LEVELS).includes(props.level as FDA_LEVELS)) {
    levelIcon = <FdaLevelIcon level={props.level as FDA_LEVELS} />;
  }
  if (props.level === FDA_LEVELS.LEVEL_FDA_NO || props.level === TX_LEVELS.LEVEL_NO || props.level === TX_LEVELS.LEVEL_EMPTY) {
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
