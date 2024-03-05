import React, { useEffect, useMemo, useState } from 'react';
import RealtimeDropdownInput, { IRealtimeDropdownInput, RealtimeDropdownOptions } from './RealtimeDropdownInput';
import { IRootStore } from 'app/stores';
import { inject } from 'mobx-react';
import { getFirebasePath, getValueByNestedKey } from 'app/shared/util/firebase/firebase-utils';
import { LEVELS, getLevelDropdownOption, isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { FDA_LEVEL_KEYS } from 'app/config/constants/firebase';
import { PropagationType } from 'app/pages/curation/collapsible/TherapyDropdownGroup';

export interface IRealtimeLevelDropdown extends IRealtimeDropdownInput, StoreProps {
  propagatedLevel?: TX_LEVELS;
  propagatedFdaLevel?: FDA_LEVEL_KEYS;
  propagationType?: PropagationType;
}

export const RealtimeLevelDropdown = (props: IRealtimeLevelDropdown) => {
  const { data, fieldKey, propagationType, propagatedLevel, propagatedFdaLevel, updateReviewableContent, options, ...dropdownProps } =
    props;
  const [currentValue, setCurrentValue] = useState(getValueByNestedKey(data, fieldKey));

  useEffect(() => {}, []);

  const updatePropagatedLevel = () => {
    if (propagatedLevel) {
      setCurrentValue(propagatedLevel);
      updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, propagatedLevel);
    } else if (propagatedFdaLevel) {
      setCurrentValue(propagatedFdaLevel);
      console.log('Updating FDA to propagated level', propagatedFdaLevel);
      updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, propagatedFdaLevel);
    }
  };

  useEffect(() => {
    if (
      propagationType === PropagationType.SOLID ||
      propagationType === PropagationType.LIQUID ||
      propagationType === PropagationType.FDA
    ) {
      if (options.length > 0 && options.filter(o => o.value === currentValue).length === 0) {
        updatePropagatedLevel();
      }
    } else if ([FDA_LEVEL_KEYS.LEVEL_FDA_NO, TX_LEVELS.LEVEL_NO, TX_LEVELS.LEVEL_EMPTY].includes(currentValue)) {
      // If the dropdowns don't already have a value, then we apply the default propagation levels
      updatePropagatedLevel();
    }
  }, [propagatedLevel, propagatedFdaLevel, options]);

  const onChangeHandler = (newValue, actionMeta) => {
    let newLevel = newValue?.value;
    if (!newLevel) {
      newLevel = TX_LEVELS.LEVEL_EMPTY;
    }
    setCurrentValue(newLevel);
    updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, newLevel);
    if (props.onChange) {
      props.onChange(newLevel, actionMeta);
    }
  };

  let value = currentValue;
  let defaultValue = getLevelDropdownOption(value);
  if (value === TX_LEVELS.LEVEL_EMPTY) {
    value = undefined;
    defaultValue = undefined;
  }

  return (
    <RealtimeDropdownInput
      {...dropdownProps}
      options={options}
      defaultValue={defaultValue}
      value={defaultValue}
      fieldKey={fieldKey}
      onChange={onChangeHandler}
    />
  );
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  data: firebaseGeneStore.data,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(RealtimeLevelDropdown);
