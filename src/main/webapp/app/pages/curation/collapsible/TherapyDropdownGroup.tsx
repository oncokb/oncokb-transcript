import { RealtimeDropdownOptions } from 'app/shared/firebase/input/RealtimeDropdownInput';
import { FDA_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import {
  LEVELS,
  getFdaPropagationInfo,
  getPropagatedLevelDropdownOptions,
  getTxLevelDropdownOptions,
  isResistanceLevel,
  isTxLevelPresent,
} from 'app/shared/util/firebase/firebase-level-utils';
import React, { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import RealtimeLevelDropdownInput, { LevelOfEvidenceType } from 'app/shared/firebase/input/RealtimeLevelDropdownInput';
import _ from 'lodash';
import { Unsubscribe } from 'firebase/auth';

export enum PropagationType {
  SOLID,
  LIQUID,
  FDA,
}

export interface ITherapyDropdownGroup extends StoreProps {
  treatmentPath: string;
}

const PLACEHOLDER = 'You must select a level';

const TherapyDropdownGroup = ({ firebaseDb, treatmentPath }: ITherapyDropdownGroup) => {
  const [highestLevel, setHighestLevel] = useState<TX_LEVELS>();
  const [propOptions, setPropOptions] = useState<RealtimeDropdownOptions<LEVELS>[]>();
  const [propFdaLevel, setPropFdaLevel] = useState<FDA_LEVELS>();
  const [propFdaOptions, setPropFdaOptions] = useState<RealtimeDropdownOptions<LEVELS | ''>[]>();
  const [isPropagationLevelsDisabled, setIsPropagationLevelsDisabled] = useState(true);
  const [isFdaPropagationLevelDisabled, setIsFdaPropagationLevelDisabled] = useState(true);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${treatmentPath}/level`), snapshot => {
        setHighestLevel(snapshot.val());
      }),
    );
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [treatmentPath]);

  useEffect(() => {
    if (_.isNil(highestLevel)) return;
    setIsPropagationLevelsDisabled(!isTxLevelPresent(highestLevel));
    setIsFdaPropagationLevelDisabled(highestLevel === TX_LEVELS.LEVEL_EMPTY);
    setPropOptions(getPropagatedLevelDropdownOptions(highestLevel));

    const fdaPropagation = getFdaPropagationInfo(highestLevel);
    setPropFdaLevel(fdaPropagation.defaultPropagation as FDA_LEVELS);
    setPropFdaOptions(fdaPropagation.dropdownOptions);
  }, [highestLevel]);

  if (_.isNil(highestLevel)) {
    return <></>;
  }

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
            options={propOptions ?? []}
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
            options={propOptions ?? []}
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
        options={propFdaOptions ?? []}
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
