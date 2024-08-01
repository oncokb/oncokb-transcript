import React from 'react';
import Select, { GroupBase, MultiValue, OptionsOrGroups, Props as SelectProps } from 'react-select';
import { RealtimeBasicLabel } from './RealtimeBasicInput';

export type RealtimeDropdownOptions<T> = {
  label: React.ReactElement;
  value: T;
};

export const getDefaultOptions = (values: string[]) => {
  return values.map(value => ({ label: value, value }));
};

export interface IRealtimeDropdownInput<Option, IsMulti extends boolean = boolean> extends SelectProps<Option, IsMulti> {
  options: OptionsOrGroups<Option, GroupBase<Option>>;
  labelClass?: string;
  label?: string;
}

const RealtimeDropdownInput = <Option, IsMulti extends boolean = boolean>(props: IRealtimeDropdownInput<Option, IsMulti>) => {
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
