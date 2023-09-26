import classNames from 'classnames';
import React from 'react';
import { Input, Label } from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import classnames from 'classnames';

export enum RealtimeInputType {
  TEXT = 'text',
  INLINE_TEXT = 'text',
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

  const isCheckType = type === RealtimeInputType.CHECKBOX || type === RealtimeInputType.RADIO;
  const isInlineInputText = type === RealtimeInputType.INLINE_TEXT;

  const labelComponent = label && (
    <Label id={id} for={id} className={classnames(labelClass, 'text-nowrap')}>
      {label}
    </Label>
  );

  const inputComponent = (
    <Input
      className={classNames(inputClass, isCheckType && 'ml-1 position-relative')}
      id={id}
      name={name}
      autoComplete="off"
      onChange={e => {
        onChange && onChange(e);
      }}
      type={props.type as InputType}
      style={isCheckType ? { marginRight: '0.25rem' } : null}
      {...otherProps}
    >
      {children}
    </Input>
  );

  return (
    <div className={classNames('mb-2', className)}>
      {isCheckType ? (
        <>
          {inputComponent}
          {labelComponent}
        </>
      ) : isInlineInputText ? (
        <div className={'d-flex'}>
          <div className={'mr-2 d-flex'}>{labelComponent}:</div>
          {inputComponent}
        </div>
      ) : (
        <>
          {labelComponent}
          {inputComponent}
        </>
      )}
    </div>
  );
};
