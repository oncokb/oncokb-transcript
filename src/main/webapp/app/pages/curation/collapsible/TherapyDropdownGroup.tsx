import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';
import RealtimeLevelDropdown from 'app/shared/firebase/input/RealtimeLevelDropdown';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getFdaPropagationInfo, getTxLevelDropdownOptions, isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
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

const defaultPropFdaLevel = FDA_LEVEL_KEYS.LEVEL_FDA_NO;

export const TherapyDropdownGroup = ({ defaultLevel, firebaseIndex, tumorIndex, tiIndex, treatmentIndex }: ITherapyDropdownGroup) => {
  const [level, setLevel] = useState<TX_LEVELS>(TX_LEVELS.LEVEL_EMPTY);
  const [propagationOptions, setPropagationOptions] = useState<RealtimeDropdownOptions[]>([]);
  const [propFdaLevel, setPropFdaLevel] = useState(defaultPropFdaLevel);
  const [propFdaOptions, setPropFdaOptions] = useState<RealtimeDropdownOptions[]>([]);

  useEffect(() => {
    setLevel(defaultLevel);
  }, []);

  const isPropagationLevelsDisabled = useMemo(() => {
    return !isTxLevelPresent(level);
  }, [level]);

  const isFdaPropagationLevelDisabled = useMemo(() => {
    return level === TX_LEVELS.LEVEL_EMPTY;
  }, [level]);

  useEffect(() => {
    const fdaPropagation = getFdaPropagationInfo(level);
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
        options={getTxLevelDropdownOptions()}
        onChange={newLevel => {
          setLevel(newLevel as TX_LEVELS);
        }}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        isDisabled={isPropagationLevelsDisabled}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagation`}
        label="Level of Evidence in other solid tumor types"
        name="propagationLevel"
        options={propagationOptions}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        isDisabled={isPropagationLevelsDisabled}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/propagationLiquid`}
        label="Level of Evidence in other liquid tumor types"
        name="propagationLiquidLevel"
        options={propagationOptions}
      />
      <RealtimeLevelDropdown
        isSearchable={false}
        isClearable={false}
        isDisabled={isFdaPropagationLevelDisabled}
        fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/fdaLevel`}
        label="FDA Level of Evidence"
        name="propagationFdaLevel"
        propagatedFdaLevel={propFdaLevel}
        options={propFdaOptions}
      />
    </>
  );
};
