import React from 'react';
import Select, { GroupBase, OptionsOrGroups, Props as SelectProps } from 'react-select';
import { RealtimeBasicLabel } from './RealtimeBasicInput';

export type RealtimeDropdownOptions = {
  label: React.ReactElement;
  value: any;
};

export const getDefaultOptions = (values: string[]) => {
  return values.map(value => ({ label: value, value }));
};

export interface IRealtimeDropdownInput extends SelectProps {
  options: OptionsOrGroups<any, GroupBase<any>>;
  labelClass?: string;
  label?: string;
}

const RealtimeDropdownInput = (props: IRealtimeDropdownInput) => {
  const { options, labelClass, label, onChange, defaultValue, ...selectProps } = props;

  return (
    <div className="flex d-flex mb-2 align-items-center">
      <div>{props.label && <RealtimeBasicLabel label={props.label} id={props.label} labelClass="me-2 fw-bold" />}</div>
      <div className="flex-grow-1">
        <Select {...selectProps} onChange={onChange} options={options} defaultValue={defaultValue} />
      </div>
    </div>
  );
};

export default RealtimeDropdownInput;
