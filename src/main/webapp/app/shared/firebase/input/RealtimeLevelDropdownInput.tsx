import { FDA_LEVELS, Review, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getLevelDropdownOption } from 'app/shared/util/firebase/firebase-level-utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import RealtimeDropdownInput, { IRealtimeDropdownInput } from './RealtimeDropdownInput';
import { componentInject } from 'app/shared/util/typed-inject';

export enum LevelOfEvidenceType {
  HIGHEST_LEVEL,
  PROPAGATED_LIQUID,
  PROPAGATED_SOLID,
  PROPAGATED_FDA,
  DIAGNOSTIC,
  PROGNOSTIC,
}

export interface IRealtimeLevelDropdown extends IRealtimeDropdownInput, StoreProps {
  levelOfEvidenceType: LevelOfEvidenceType;
  firebaseLevelPath: string;
  highestLevel?: TX_LEVELS; // Required for propagated levels
  propagatedFdaLevel?: FDA_LEVELS;
  placeholder?: string;
}

const RealtimeLevelDropdown = (props: IRealtimeLevelDropdown) => {
  const {
    firebaseDb,
    highestLevel,
    levelOfEvidenceType,
    propagatedFdaLevel,
    firebaseLevelPath,
    updateReviewableContent,
    options,
    isDisabled,
    placeholder,
    ...dropdownProps
  } = props;

  const levelFetchCount = useRef(0);

  const [currentLOE, setCurrentLOE] = useState(undefined);
  const [LOEReview, setLOEReview] = useState<Review>(undefined);
  const [LOEUuid, setLOEUuid] = useState<string>(undefined);

  const [defaultValue, setDefaultValue] = useState(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, firebaseLevelPath), snapshot => {
        const level = snapshot.val();
        setCurrentLOE(level);
        levelFetchCount.current++;
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${firebaseLevelPath}_review`), snapshot => {
        setLOEReview(snapshot.val());
      }),
    );
    onValue(
      ref(firebaseDb, `${firebaseLevelPath}_uuid`),
      snapshot => {
        setLOEUuid(snapshot.val());
      },
      { onlyOnce: true },
    );

    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [firebaseLevelPath, firebaseDb]);

  useEffect(() => {
    if (currentLOE) {
      let defaultVal = getLevelDropdownOption(currentLOE);
      if (currentLOE === TX_LEVELS.LEVEL_EMPTY || isDisabled) {
        defaultVal = undefined;
      }
      setDefaultValue(defaultVal);
    }
  }, [currentLOE]);

  useEffect(() => {
    if (!LOEUuid) return;

    // Only update to default propagation level after highestLevel is changed by user, not on initial load.
    // Initially, it should display the levels retrieved from firebase
    if (levelFetchCount.current === 1) {
      levelFetchCount.current++;
      return;
    }

    if (levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_SOLID || levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_LIQUID) {
      // When highestLevel changes, the propagated levels should reset to no level
      if (highestLevel) {
        updateReviewableContent(firebaseLevelPath, currentLOE, TX_LEVELS.LEVEL_NO, LOEReview, LOEUuid);
      }
    }

    if (levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_FDA) {
      // When highestLevel changes, the fda propagation should be reset to default
      if (propagatedFdaLevel) {
        updateReviewableContent(firebaseLevelPath, currentLOE, propagatedFdaLevel, LOEReview, LOEUuid);
      }
    }
  }, [highestLevel, LOEUuid, propagatedFdaLevel]);

  const onChangeHandler = (newValue, actionMeta) => {
    const oldLevel = currentLOE;
    let newLevel = newValue?.value;
    if (!newLevel) {
      newLevel = TX_LEVELS.LEVEL_EMPTY;
    }

    updateReviewableContent(firebaseLevelPath, oldLevel, newLevel, LOEReview, LOEUuid);
    if (props.onChange) {
      props.onChange(newLevel, actionMeta);
    }
  };

  return (
    <RealtimeDropdownInput
      {...dropdownProps}
      placeholder={placeholder ? placeholder : 'Select a level'}
      options={options}
      defaultValue={defaultValue}
      value={defaultValue}
      onChange={onChangeHandler}
      isDisabled={isDisabled}
    />
  );
};

const mapStoreToProps = ({ firebaseGeneReviewService, firebaseAppStore }: IRootStore) => ({
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(RealtimeLevelDropdown);
