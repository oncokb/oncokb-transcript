import React from 'react';
import { Input, Label } from 'reactstrap';

export enum RealtimeInputType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
}

export type RealtimeBasicInput = Exclude<RealtimeInputType, RealtimeInputType.DROPDOWN>;

export interface IRealtimeBasicInput extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  type: RealtimeBasicInput;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
  labelClass?: string;
  label?: string;
  inputClass?: string;
}

export const RealtimeBasicInput: React.FunctionComponent<IRealtimeBasicInput> = props => {
  const { name, id = name, type, onChange, className, labelClass, label, inputClass, children, ...otherProps } = props;
  return (
    <div className={`mb-2 ${className}`}>
      {label && (
        <Label id={name} for={name} className={labelClass}>
          {label}
        </Label>
      )}
      <Input
        className={inputClass}
        id={id}
        name={name}
        autoComplete="off"
        onChange={e => {
          onChange && onChange(e);
        }}
        type={props.type as any}
        style={type === 'checkbox' ? { marginLeft: '0.25rem' } : null}
        {...otherProps}
      >
        {children}
      </Input>
    </div>
  );
};
