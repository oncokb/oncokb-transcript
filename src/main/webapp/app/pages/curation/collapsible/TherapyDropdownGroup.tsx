import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import {
  getFdaPropagationInfo,
  getPropagatedLevelDropdownOptions,
  getTxLevelDropdownOptions,
  isResistanceLevel,
  isTxLevelPresent,
} from 'app/shared/util/firebase/firebase-level-utils';
import React, { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import RealtimeLevelDropdownInput, { LevelOfEvidenceType } from 'app/shared/firebase/input/RealtimeLevelDropdownInput';

export enum PropagationType {
  SOLID,
  LIQUID,
  FDA,
}

export interface ITherapyDropdownGroup extends StoreProps {
  treatmentPath: string;
}

const defaultPropFdaLevel = FDA_LEVEL_KEYS.LEVEL_FDA_NO;
const PLACEHOLDER = 'You must select a level';

const TherapyDropdownGroup = ({ firebaseDb, treatmentPath }: ITherapyDropdownGroup) => {
  const [highestLevel, setHighestLevel] = useState<TX_LEVELS>(TX_LEVELS.LEVEL_EMPTY);
  const [propFdaLevel, setPropFdaLevel] = useState(defaultPropFdaLevel);
  const [propFdaOptions, setPropFdaOptions] = useState<RealtimeDropdownOptions[]>([]);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${treatmentPath}/level`), snapshot => {
        setHighestLevel(snapshot.val());
      })
    );
    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      callbacks.forEach(callback => callback?.());
    };
  }, [treatmentPath]);

  const isPropagationLevelsDisabled = useMemo(() => {
    return !isTxLevelPresent(highestLevel);
  }, [highestLevel]);

  const isFdaPropagationLevelDisabled = useMemo(() => {
    return highestLevel === TX_LEVELS.LEVEL_EMPTY;
  }, [highestLevel]);

  const propagationOptions = useMemo(() => {
    return getPropagatedLevelDropdownOptions(highestLevel);
  }, [highestLevel]);

  useEffect(() => {
    const fdaPropagation = getFdaPropagationInfo(highestLevel);
    setPropFdaLevel(fdaPropagation.defaultPropagation as FDA_LEVEL_KEYS);
    setPropFdaOptions(fdaPropagation.dropdownOptions);
  }, [highestLevel]);

  return (
    <>
      <RealtimeLevelDropdownInput
        levelOfEvidenceType={LevelOfEvidenceType.HIGHEST_LEVEL}
        isSearchable={false}
        isClearable={false}
        firebaseLevelPath={`${treatmentPath}/level`}
        label="Highest level of evidence"
        name="level"
        options={getTxLevelDropdownOptions()}
        placeholder={PLACEHOLDER}
      />
      {!isResistanceLevel(highestLevel) ? (
        <>
          <RealtimeLevelDropdownInput
            levelOfEvidenceType={LevelOfEvidenceType.PROPAGATED_SOLID}
            isSearchable={false}
            isClearable={false}
            isDisabled={isPropagationLevelsDisabled}
            firebaseLevelPath={`${treatmentPath}/propagation`}
            label="Level of Evidence in other solid tumor types"
            name="propagationLevel"
            options={propagationOptions}
            highestLevel={highestLevel}
            placeholder={PLACEHOLDER}
          />
          <RealtimeLevelDropdownInput
            levelOfEvidenceType={LevelOfEvidenceType.PROPAGATED_LIQUID}
            isSearchable={false}
            isClearable={false}
            isDisabled={isPropagationLevelsDisabled}
            firebaseLevelPath={`${treatmentPath}/propagationLiquid`}
            label="Level of Evidence in other liquid tumor types"
            name="propagationLiquidLevel"
            options={propagationOptions}
            highestLevel={highestLevel}
            placeholder={PLACEHOLDER}
          />
        </>
      ) : undefined}
      <RealtimeLevelDropdownInput
        levelOfEvidenceType={LevelOfEvidenceType.PROPAGATED_FDA}
        isSearchable={false}
        isClearable={false}
        isDisabled={isFdaPropagationLevelDisabled}
        firebaseLevelPath={`${treatmentPath}/fdaLevel`}
        label="FDA Level of Evidence"
        name="propagationFdaLevel"
        propagatedFdaLevel={propFdaLevel}
        options={propFdaOptions}
        placeholder={PLACEHOLDER}
      />
    </>
  );
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TherapyDropdownGroup));
