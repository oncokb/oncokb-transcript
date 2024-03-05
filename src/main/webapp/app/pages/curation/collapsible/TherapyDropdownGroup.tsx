import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';
import RealtimeLevelDropdown from 'app/shared/firebase/input/RealtimeLevelDropdown';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import {
  getFdaLevelDropdownOptions,
  getPropagatedLevelDropdownOptions,
  getTxLevelDropdownOptions,
  isTxLevelPresent,
} from 'app/shared/util/firebase/firebase-level-utils';
import React, { useEffect, useMemo, useState } from 'react';

export enum PropagationType {
  SOLID,
  LIQUID,
  FDA,
}

export interface ITherapyDropdownGroup {
  defaultLevel: TX_LEVELS;
  firebaseIndex: number;
  tumorIndex: number;
  tiIndex: number;
  treatmentIndex: number;
}

export const TherapyDropdownGroup = ({ defaultLevel, firebaseIndex, tumorIndex, tiIndex, treatmentIndex }: ITherapyDropdownGroup) => {
  const [level, setLevel] = useState<TX_LEVELS>(TX_LEVELS.LEVEL_EMPTY);
  const [propSolidLevel, setPropSolidLevel] = useState(TX_LEVELS.LEVEL_NO);
  const [propSolidOptions, setPropSolidOptions] = useState<RealtimeDropdownOptions[]>([]);
  const [propLiquidLevel, setPropLiquidLevel] = useState(TX_LEVELS.LEVEL_NO);
  const [propLiquidOptions, setPropLiquidOptions] = useState<RealtimeDropdownOptions[]>([]);
  const [propFdaLevel, setPropFdaLevel] = useState(FDA_LEVEL_KEYS.LEVEL_FDA_NO);
  const [propFdaOptions, setPropFdaOptions] = useState<RealtimeDropdownOptions[]>([]);

  useEffect(() => {
    setLevel(defaultLevel);
  }, []);

  const isPropagationLevelsDisabled = useMemo(() => {
    return !isTxLevelPresent(level);
  }, [level]);

  useEffect(() => {
    if (isTxLevelPresent(level)) {
      const solidPropagation = getPropagatedLevelDropdownOptions(PropagationType.SOLID, level);
      setPropSolidLevel(solidPropagation.defaultPropagation as TX_LEVELS);
      setPropSolidOptions(solidPropagation.dropdownOptions);
      const liquidPropagation = getPropagatedLevelDropdownOptions(PropagationType.LIQUID, level);
      setPropLiquidLevel(liquidPropagation.defaultPropagation as TX_LEVELS);
      setPropLiquidOptions(liquidPropagation.dropdownOptions);
    }
    const fdaPropagation = getFdaLevelDropdownOptions(level);
    setPropFdaLevel(fdaPropagation.defaultPropagation as FDA_LEVEL_KEYS);
    setPropFdaOptions(fdaPropagation.dropdownOptions);
  }, [level]);

  return (
    <>
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/level`}
        label="Highest level of evidence"
        name="level"
        placeholder={'You must select a level'}
        options={getTxLevelDropdownOptions()}
        onChange={newLevel => {
          setLevel(newLevel as TX_LEVELS);
        }}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        propagationType={PropagationType.SOLID}
        isDisabled={isPropagationLevelsDisabled}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagation`}
        label="Level of Evidence in other solid tumor types"
        name="propagationLevel"
        propagatedLevel={propSolidLevel}
        options={propSolidOptions}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        propagationType={PropagationType.LIQUID}
        isDisabled={isPropagationLevelsDisabled}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagationLiquid`}
        label="Level of Evidence in other liquid tumor types"
        name="propagationLiquidLevel"
        propagatedLevel={propLiquidLevel}
        options={propLiquidOptions}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        propagationType={PropagationType.FDA}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/fdaLevel`}
        label="FDA Level of Evidence"
        name="propagationFdaLevel"
        propagatedFdaLevel={propFdaLevel}
        options={propFdaOptions}
      />
    </>
  );
};
