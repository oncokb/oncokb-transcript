import React from 'react';
import RealtimeBasicInput, { IRealtimeBasicInput, RealtimeInputType } from './RealtimeBasicInput';

/**
 * Text inputs
 */
export interface IRealtimeTextInput extends Omit<IRealtimeBasicInput, 'type'> {
  inline?: boolean;
}
export const RealtimeTextInput = ({ inline = false, ...otherProps }: IRealtimeTextInput) => {
  return <RealtimeBasicInput {...otherProps} type={inline ? RealtimeInputType.INLINE_TEXT : RealtimeInputType.TEXT} />;
};

export const RealtimeTextAreaInput = (props: Omit<IRealtimeBasicInput, 'type'>) => {
  return <RealtimeBasicInput {...props} type={RealtimeInputType.TEXTAREA} />;
};

/**
 * Checkbox and Radio inputs
 */
export const RealtimeCheckboxInput = (props: Omit<IRealtimeBasicInput, 'type'>) => {
  return <RealtimeBasicInput {...props} type={RealtimeInputType.CHECKBOX} />;
};

export const RealtimeRadioInput = (props: Omit<IRealtimeBasicInput, 'type'>) => {
  return <RealtimeBasicInput {...props} type={RealtimeInputType.RADIO} />;
};

/**
 * Checked Input Group
 */
export type RealtimeCheckedInputOption = {
  firebasePath: string;
  label: string;
};

export interface IRealtimeCheckedInputGroup {
  groupHeader: string | JSX.Element;
  isRadio?: boolean;
  inlineHeader?: boolean;
  options: RealtimeCheckedInputOption[];
}

export const RealtimeCheckedInputGroup = (props: IRealtimeCheckedInputGroup) => {
  return (
    <div className="mb-2">
      <div className="d-flex align-items-center font-weight-bold text-nowrap">{props.groupHeader}</div>
      <div className="d-flex flex-wrap">
        {props.options.map(option => {
          return props.isRadio ? (
            <RealtimeRadioInput key={option.label} firebasePath={option.firebasePath} className="mr-2" label={option.label} />
          ) : (
            <RealtimeCheckboxInput key={option.label} firebasePath={option.firebasePath} className="mr-2" label={option.label} />
          );
        })}
      </div>
    </div>
  );
};
