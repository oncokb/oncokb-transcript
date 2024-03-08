import React from 'react';
import { GroupBase, OptionsOrGroups, Props as SelectProps } from 'react-select';
import Select from 'react-select';
import { ExtractPathExpressions } from '../../util/firebase/firebase-crud-store';
import { Gene } from '../../model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { inject } from 'mobx-react';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { RealtimeBasicLabel } from './RealtimeBasicInput';

export type RealtimeDropdownOptions = {
  label: React.ReactElement;
  value: any;
};

export const getDefaultOptions = (values: string[]) => {
  return values.map(value => ({ label: value, value }));
};

export interface IRealtimeDropdownInput extends SelectProps {
  fieldKey: ExtractPathExpressions<Gene>;
  options: OptionsOrGroups<any, GroupBase<any>>;
  labelClass?: string;
  label?: string;
}

const RealtimeDropdownInput = (props: IRealtimeDropdownInput) => {
  const { fieldKey, options, labelClass, label, onChange, defaultValue, ...selectProps } = props;

  return (
    <div className="flex d-flex mb-2 align-items-center">
      <div>{props.label && <RealtimeBasicLabel label={props.label} id={props.label} labelClass="mr-2 font-weight-bold" />}</div>
      <div className="flex-grow-1">
        <Select {...selectProps} onChange={onChange} options={options} defaultValue={defaultValue} />
      </div>
    </div>
  );
};

export default RealtimeDropdownInput;
