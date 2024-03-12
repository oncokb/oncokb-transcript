import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import {
  getFdaPropagationInfo,
  getPropagatedLevelDropdownOptions,
  getTxLevelDropdownOptions,
  isTxLevelPresent,
} from 'app/shared/util/firebase/firebase-level-utils';
import React, { useEffect, useMemo, useState } from 'react';
import RealtimeLevelDropdownInput from './input/RealtimeLevelDropdownInput';
import { onValue, ref } from 'firebase/database';
import { IRootStore } from 'app/stores';
import { inject } from 'mobx-react';

export enum PropagationType {
  SOLID,
  LIQUID,
  FDA,
}

export interface ITherapyDropdownGroup extends StoreProps {
  treatmentPath: string;
}

const defaultPropFdaLevel = FDA_LEVEL_KEYS.LEVEL_FDA_NO;

export const TherapyDropdownGroup = ({ firebaseDb, treatmentPath }: ITherapyDropdownGroup) => {
  const [level, setLevel] = useState<TX_LEVELS>(TX_LEVELS.LEVEL_EMPTY);
  const [propFdaLevel, setPropFdaLevel] = useState(defaultPropFdaLevel);
  const [propFdaOptions, setPropFdaOptions] = useState<RealtimeDropdownOptions[]>([]);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, treatmentPath), snapshot => {
        setLevel(snapshot.val());
      })
    );
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, []);

  const isPropagationLevelsDisabled = useMemo(() => {
    return !isTxLevelPresent(level);
  }, [level]);

  const isFdaPropagationLevelDisabled = useMemo(() => {
    return level === TX_LEVELS.LEVEL_EMPTY;
  }, [level]);

  const propagationOptions = useMemo(() => {
    return getPropagatedLevelDropdownOptions(level);
  }, [level]);

  useEffect(() => {
    const fdaPropagation = getFdaPropagationInfo(level);
    setPropFdaLevel(fdaPropagation.defaultPropagation as FDA_LEVEL_KEYS);
    setPropFdaOptions(fdaPropagation.dropdownOptions);
  }, [level]);

  return (
    <>
      <RealtimeLevelDropdownInput
        isSearchable={false}
        isClearable={false}
        firebaseLevelPath={`${treatmentPath}/level`}
        label="Highest level of evidence"
        name="level"
        options={getTxLevelDropdownOptions()}
        // onChange={newLevel => {
        //   setLevel(newLevel as TX_LEVELS);
        // }}
      />
      <RealtimeLevelDropdownInput
        isSearchable={false}
        isClearable={false}
        isDisabled={isPropagationLevelsDisabled}
        firebaseLevelPath={`${treatmentPath}/propagation`}
        label="Level of Evidence in other solid tumor types"
        name="propagationLevel"
        options={propagationOptions}
      />
      <RealtimeLevelDropdownInput
        isSearchable={false}
        isClearable={false}
        isDisabled={isPropagationLevelsDisabled}
        firebaseLevelPath={`${treatmentPath}/propagationLiquid`}
        label="Level of Evidence in other liquid tumor types"
        name="propagationLiquidLevel"
        options={propagationOptions}
      />
      <RealtimeLevelDropdownInput
        isSearchable={false}
        isClearable={false}
        isDisabled={isFdaPropagationLevelDisabled}
        firebaseLevelPath={`${treatmentPath}/fdaLevel`}
        label="FDA Level of Evidence"
        name="propagationFdaLevel"
        propagatedFdaLevel={propFdaLevel}
        options={propFdaOptions}
      />
      {/* <RealtimeLevelDropdown
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
      /> */}
    </>
  );
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(TherapyDropdownGroup);
