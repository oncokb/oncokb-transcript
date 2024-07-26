import { DX_LEVELS, FDA_LEVELS, PX_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { SortOrder, sortByIndex } from './firebase-utils';
import {
  ALL_LEVELS,
  DIAGNOSTIC_LEVELS_ORDERING,
  FDA_LEVELS_ORDERING,
  PROGNOSTIC_LEVELS_ORDERING,
  THERAPEUTIC_LEVELS_ORDERING,
  THERAPEUTIC_RESISTANCE_LEVELS,
  THERAPEUTIC_SENSITIVE_LEVELS,
} from 'app/config/constants/firebase';
import React from 'react';
import { LevelWithDescription } from 'app/shared/text/LevelWithDescription';
import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';

export enum LevelType {
  ALL,
  THERAPEUTIC,
  THERAPEUTIC_SENSITIVE,
  THERAPEUTIC_RESISTANCE,
  PROGNOSTIC,
  DIAGNOSTIC,
  FDA,
}

export type LEVELS = ONCOKB_LEVELS | FDA_LEVELS;

export type ONCOKB_LEVELS = TX_LEVELS | PX_LEVELS | DX_LEVELS;

export const isTxLevelPresent = (txLevel: TX_LEVELS | undefined) => {
  return txLevel !== undefined && txLevel !== TX_LEVELS.LEVEL_NO && txLevel !== TX_LEVELS.LEVEL_EMPTY;
};

export const isResistanceLevel = (txLevel: TX_LEVELS) => {
  return [TX_LEVELS.LEVEL_R1, TX_LEVELS.LEVEL_R2].includes(txLevel);
};

export const getLevelOrderingByLevelType = (levelType: LevelType) => {
  switch (levelType) {
    case LevelType.ALL:
      return ALL_LEVELS;
    case LevelType.THERAPEUTIC:
      return THERAPEUTIC_LEVELS_ORDERING;
    case LevelType.THERAPEUTIC_SENSITIVE:
      return THERAPEUTIC_SENSITIVE_LEVELS;
    case LevelType.PROGNOSTIC:
      return PROGNOSTIC_LEVELS_ORDERING;
    case LevelType.DIAGNOSTIC:
      return DIAGNOSTIC_LEVELS_ORDERING;
    case LevelType.FDA:
      return FDA_LEVELS_ORDERING;
    default:
      return [];
  }
};

export const sortByLevelOfEvidence = (a: LEVELS, b: LEVELS, levelPriority: LEVELS[], order: SortOrder = 'asc') => {
  const ordering = levelPriority;
  const aIndex = ordering.indexOf(a);
  const bIndex = ordering.indexOf(b);
  return sortByIndex(aIndex, bIndex, order);
};

export const getLevelDropdownOptions = (levels: LEVELS[]) => {
  return levels.map(level => getLevelDropdownOption(level));
};

export const getLevelDropdownOption = (level: LEVELS): RealtimeDropdownOptions => {
  return { label: <LevelWithDescription level={level} />, value: level };
};

export const getTxLevelDropdownOptions = () => {
  const sensitiveLevels = getLevelDropdownOptions(THERAPEUTIC_SENSITIVE_LEVELS.filter(level => level !== TX_LEVELS.LEVEL_3B));
  const resistanceLevels = getLevelDropdownOptions(THERAPEUTIC_RESISTANCE_LEVELS);
  return [
    { label: 'Sensitive Levels', options: sensitiveLevels },
    { label: 'Resistance Levels', options: resistanceLevels },
  ];
};

export type PropagatedDropdownLevels = {
  dropdownOptions: RealtimeDropdownOptions[];
  defaultPropagation: TX_LEVELS | FDA_LEVELS | '';
};

export const getFdaPropagationInfo = (txLevel: TX_LEVELS): PropagatedDropdownLevels => {
  let propagationOptions: FDA_LEVELS[] = [];
  let defaultPropagation = '';
  if (txLevel === TX_LEVELS.LEVEL_1 || txLevel === TX_LEVELS.LEVEL_2 || txLevel === TX_LEVELS.LEVEL_R1) {
    propagationOptions = [FDA_LEVELS.LEVEL_FDA2, FDA_LEVELS.LEVEL_FDA3, FDA_LEVELS.LEVEL_FDA_NO];
    defaultPropagation = FDA_LEVELS.LEVEL_FDA2;
  } else {
    propagationOptions = [FDA_LEVELS.LEVEL_FDA3, FDA_LEVELS.LEVEL_FDA_NO];
    defaultPropagation = FDA_LEVELS.LEVEL_FDA3;
  }
  return {
    dropdownOptions: getLevelDropdownOptions(propagationOptions),
    defaultPropagation: defaultPropagation as FDA_LEVELS,
  };
};

export const getPropagatedLevelDropdownOptions = (txLevel: TX_LEVELS): RealtimeDropdownOptions[] => {
  let propagationOptions: LEVELS[] = [];
  if (txLevel === TX_LEVELS.LEVEL_1 || txLevel === TX_LEVELS.LEVEL_2 || txLevel === TX_LEVELS.LEVEL_3A) {
    propagationOptions = [TX_LEVELS.LEVEL_3B, TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_NO];
  } else if (txLevel === TX_LEVELS.LEVEL_4) {
    propagationOptions = [TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_NO];
  }
  return getLevelDropdownOptions(propagationOptions);
};
