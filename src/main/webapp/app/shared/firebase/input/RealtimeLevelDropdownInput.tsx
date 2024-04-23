import { FDA_LEVEL_KEYS, FDA_LEVEL_KEYS_MAPPING } from 'app/config/constants/firebase';
import { Review, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getLevelDropdownOption } from 'app/shared/util/firebase/firebase-level-utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
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
  propagatedFdaLevel?: FDA_LEVEL_KEYS;
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

  const [currentLOE, setCurrentLOE] = useState(undefined);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [LOEReview, setLOEReview] = useState<Review>(undefined);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [LOEUuid, setLOEUuid] = useState<string>(undefined);

  const [defaultValue, setDefaultValue] = useState(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, firebaseLevelPath), snapshot => {
        let level = snapshot.val();
        if (levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_FDA) {
          for (const k of Object.keys(FDA_LEVEL_KEYS_MAPPING)) {
            if (FDA_LEVEL_KEYS_MAPPING[k] === level) {
              level = k;
            }
          }
        }
        setCurrentLOE(level);
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${firebaseLevelPath}_review`), snapshot => {
        setLOEReview(snapshot.val());
      })
    );
    onValue(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ref(firebaseDb, `${firebaseLevelPath}_uuid`),
      snapshot => {
        setLOEUuid(snapshot.val());
      },
      { onlyOnce: true }
    );

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      callbacks.forEach(callback => callback?.());
    };
  }, [firebaseLevelPath, firebaseDb]);

  useEffect(() => {
    if (currentLOE) {
      let defaultVal = getLevelDropdownOption(currentLOE);
      if (currentLOE === TX_LEVELS.LEVEL_EMPTY || isDisabled) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        defaultVal = undefined;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setDefaultValue(defaultVal);
    }
  }, [currentLOE]);

  useEffect(() => {
    if (!LOEUuid) {
      return;
    }
    // When highest level changes, the propagated levels should reset to no level
    if (
      highestLevel &&
      (levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_SOLID || levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_LIQUID)
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateReviewableContent(firebaseLevelPath, currentLOE, TX_LEVELS.LEVEL_NO, LOEReview, LOEUuid);
    }
  }, [highestLevel, LOEUuid]);

  useEffect(() => {
    if (!LOEUuid) {
      return;
    }
    if (propagatedFdaLevel && propagatedFdaLevel !== currentLOE) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateReviewableContent(firebaseLevelPath, currentLOE, FDA_LEVEL_KEYS_MAPPING[propagatedFdaLevel], LOEReview, LOEUuid);
    }
  }, [propagatedFdaLevel, LOEUuid]);

  const onChangeHandler = (newValue, actionMeta) => {
    let newLevel = newValue?.value;
    if (!newLevel) {
      newLevel = TX_LEVELS.LEVEL_EMPTY;
    }
    if (levelOfEvidenceType === LevelOfEvidenceType.PROPAGATED_FDA) {
      newLevel = FDA_LEVEL_KEYS_MAPPING[newLevel];
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateReviewableContent(firebaseLevelPath, currentLOE, newLevel, LOEReview, LOEUuid);
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
