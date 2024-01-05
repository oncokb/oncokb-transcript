import React from 'react';
import { ExtractPathExpressions } from '../../util/firebase/firebase-crud-store';
import { Gene } from '../../model/firebase/firebase.model';
import RealtimeBasicInput, { IRealtimeBasicInput } from './RealtimeBasicInput';

export enum RealtimeInputType {
  TEXT = 'text',
  INLINE_TEXT = 'inline_text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
}

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
  fieldKey: ExtractPathExpressions<Gene>;
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
    <div className="flex d-flex">
      <span className="font-weight-bold text-nowrap">{props.groupHeader}:</span>
      <span className="d-flex flex-wrap">
        {props.options.map(option => {
          return props.isRadio ? (
            <RealtimeRadioInput key={option.label} fieldKey={option.fieldKey} className="ml-2" label={option.label} />
          ) : (
            <RealtimeCheckboxInput key={option.label} fieldKey={option.fieldKey} className="ml-2" label={option.label} />
          );
        })}
      </span>
    </div>
  );
};
