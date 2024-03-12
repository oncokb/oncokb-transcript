import { FDA_LEVEL_KEYS, FDA_LEVEL_KEYS_MAPPING } from 'app/config/constants/firebase';
import { Review, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getLevelDropdownOption } from 'app/shared/util/firebase/firebase-level-utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { inject } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import RealtimeDropdownInput, { IRealtimeDropdownInput } from './RealtimeDropdownInput';

export interface IRealtimeLevelDropdown extends IRealtimeDropdownInput, StoreProps {
  propagatedFdaLevel?: FDA_LEVEL_KEYS;
  firebaseLevelPath: string;
}

export const RealtimeLevelDropdown = (props: IRealtimeLevelDropdown) => {
  const { firebaseDb, propagatedFdaLevel, firebaseLevelPath, updateReviewableContent, options, isDisabled, ...dropdownProps } = props;

  const [currentLOE, setCurrentLOE] = useState(undefined);
  const [LOEReview, setLOEReview] = useState<Review>(undefined);
  const [LOEUuid, setLOEUuid] = useState<string>(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, firebaseLevelPath), snapshot => {
        setCurrentLOE(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${firebaseLevelPath}_review`), snapshot => {
        setLOEReview(snapshot.val());
      })
    );
    onValue(
      ref(firebaseDb, `${firebaseLevelPath}_uuid`),
      snapshot => {
        setLOEUuid(snapshot.val());
      },
      { onlyOnce: true }
    );
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, []);

  useEffect(() => {
    if (propagatedFdaLevel && propagatedFdaLevel !== currentLOE) {
      // setCurrentLOE(propagatedFdaLevel);
      updateReviewableContent(firebaseLevelPath, currentLOE, FDA_LEVEL_KEYS_MAPPING[propagatedFdaLevel], LOEReview, LOEUuid);
    }
  }, [propagatedFdaLevel]);

  const onChangeHandler = (newValue, actionMeta) => {
    let newLevel = newValue?.value;
    if (!newLevel) {
      newLevel = TX_LEVELS.LEVEL_EMPTY;
    }
    setCurrentLOE(newLevel);
    if (Object.values(FDA_LEVEL_KEYS).includes(newLevel)) {
      newLevel = FDA_LEVEL_KEYS_MAPPING[newLevel];
    }
    updateReviewableContent(firebaseLevelPath, currentLOE, newLevel, LOEReview, LOEUuid);
    if (props.onChange) {
      props.onChange(newLevel, actionMeta);
    }
  };

  let value = currentLOE;
  let defaultValue = getLevelDropdownOption(value);
  if (value === TX_LEVELS.LEVEL_EMPTY || isDisabled) {
    value = undefined;
    defaultValue = undefined;
  }

  return (
    <RealtimeDropdownInput
      {...dropdownProps}
      placeholder={'You must select a level'}
      options={options}
      defaultValue={defaultValue}
      value={defaultValue}
      onChange={onChangeHandler}
      isDisabled={isDisabled}
    />
  );
};

const mapStoreToProps = ({ firebaseGeneReviewStore, firebaseStore }: IRootStore) => ({
  updateReviewableContent: firebaseGeneReviewStore.updateReviewableContent,
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(RealtimeLevelDropdown);
