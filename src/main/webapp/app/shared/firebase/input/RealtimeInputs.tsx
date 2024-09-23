import React, { MouseEventHandler } from 'react';
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
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onMouseDown?: MouseEventHandler<HTMLInputElement>;
  labelOnClick?: MouseEventHandler<HTMLLabelElement>;
}

export const RealtimeCheckedInputGroup = (props: IRealtimeCheckedInputGroup) => {
  return (
    <div className="mb-2">
      <div className="d-flex align-items-center fw-bold text-nowrap">{props.groupHeader}</div>
      <div className="d-flex flex-wrap">
        {props.options.map(option => {
          return props.isRadio ? (
            <RealtimeRadioInput
              disabled={props.disabled}
              key={option.label}
              firebasePath={option.firebasePath}
              className="me-2"
              value={option.label}
              label={option.label}
              onMouseDown={props.onMouseDown}
              labelOnClick={props.labelOnClick}
              id={`${option.firebasePath}-${option.label}`}
            />
          ) : (
            <RealtimeCheckboxInput
              disabled={props.disabled}
              key={option.label}
              firebasePath={option.firebasePath}
              style={{ marginTop: '0.1rem' }}
              className="me-2"
              onMouseDown={props.onMouseDown}
              labelOnClick={props.labelOnClick}
              label={option.label}
            />
          );
        })}
      </div>
    </div>
  );
};
