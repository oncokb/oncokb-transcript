import React, { createRef, MouseEvent, useRef } from 'react';
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
  ref?: React.ForwardedRef<HTMLInputElement>;
};

export interface IRealtimeCheckedInputGroup {
  groupHeader: string | JSX.Element;
  isRadio?: boolean;
  inlineHeader?: boolean;
  options: RealtimeCheckedInputOption[];
  disabled?: boolean;
  onMouseDown?: (event: MouseEvent<HTMLInputElement>, label: string, labelsToRefs: LabelsRefMap) => void;
  labelOnClick?: (event: MouseEvent<HTMLLabelElement>, label: string, labelsToRefs: LabelsRefMap) => void;
}

export type LabelsRefMap = { [label: string]: React.RefObject<HTMLInputElement> };

export const RealtimeCheckedInputGroup = (props: IRealtimeCheckedInputGroup) => {
  const inputRefs = useRef(Array.from({ length: props.options.length }, () => createRef<HTMLInputElement>()));
  const labelToRefs: LabelsRefMap = {};
  for (let i = 0; i < props.options.length; i++) {
    labelToRefs[props.options[i].label] = inputRefs.current[i];
  }

  return (
    <div className="mb-2">
      <div className="d-flex align-items-center fw-bold text-nowrap">{props.groupHeader}</div>
      <div className="d-flex flex-wrap">
        {props.options.map((option, index) => {
          return props.isRadio ? (
            <RealtimeRadioInput
              inputRef={inputRefs.current[index]}
              disabled={props.disabled}
              key={option.label}
              firebasePath={option.firebasePath}
              className="me-2"
              value={option.label}
              label={option.label}
              onMouseDown={event => props.onMouseDown?.(event, option.label, labelToRefs)}
              labelOnClick={event => props.labelOnClick?.(event, option.label, labelToRefs)}
              id={`${option.firebasePath}-${option.label}`}
            />
          ) : (
            <RealtimeCheckboxInput
              inputRef={inputRefs.current[index]}
              disabled={props.disabled}
              key={option.label}
              firebasePath={option.firebasePath}
              style={{ marginTop: '0.1rem' }}
              className="me-2"
              onMouseDown={event => props.onMouseDown?.(event, option.label, labelToRefs)}
              labelOnClick={event => props.labelOnClick?.(event, option.label, labelToRefs)}
              label={option.label}
            />
          );
        })}
      </div>
    </div>
  );
};
