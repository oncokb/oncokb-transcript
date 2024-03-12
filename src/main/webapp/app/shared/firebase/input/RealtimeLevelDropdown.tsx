import React, { useEffect, useMemo, useState } from 'react';
import RealtimeDropdownInput, { IRealtimeDropdownInput, RealtimeDropdownOptions } from './RealtimeDropdownInput';
import { IRootStore } from 'app/stores';
import { inject } from 'mobx-react';
import { getFirebasePath, getValueByNestedKey } from 'app/shared/util/firebase/firebase-utils';
import { LEVELS, getLevelDropdownOption, isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { FDA_LEVEL_KEYS, FDA_LEVEL_KEYS_MAPPING } from 'app/config/constants/firebase';

export interface IRealtimeLevelDropdown extends IRealtimeDropdownInput, StoreProps {
  propagatedFdaLevel?: FDA_LEVEL_KEYS;
}

export const RealtimeLevelDropdown = (props: IRealtimeLevelDropdown) => {
  const { data, fieldKey, propagatedFdaLevel, updateReviewableContent, options, isDisabled, ...dropdownProps } = props;
  const [currentValue, setCurrentValue] = useState(getValueByNestedKey(data, fieldKey));

  useEffect(() => {
    if (propagatedFdaLevel && propagatedFdaLevel !== currentValue) {
      setCurrentValue(propagatedFdaLevel);
      // updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, FDA_LEVEL_KEYS_MAPPING[propagatedFdaLevel]);
    }
  }, [propagatedFdaLevel]);

  const onChangeHandler = (newValue, actionMeta) => {
    let newLevel = newValue?.value;
    if (!newLevel) {
      newLevel = TX_LEVELS.LEVEL_EMPTY;
    }
    setCurrentValue(newLevel);
    if (Object.values(FDA_LEVEL_KEYS).includes(newLevel)) {
      newLevel = FDA_LEVEL_KEYS_MAPPING[newLevel];
    }
    // updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, newLevel);
    if (props.onChange) {
      props.onChange(newLevel, actionMeta);
    }
  };

  let value = currentValue;
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
      fieldKey={fieldKey}
      onChange={onChangeHandler}
      isDisabled={isDisabled}
    />
  );
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  data: firebaseGeneStore.data,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(RealtimeLevelDropdown);
