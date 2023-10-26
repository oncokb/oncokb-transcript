import classNames from 'classnames';
import React from 'react';
import { Input, Label } from 'reactstrap';
import { Props as SelectProps } from 'react-select';
import Select from 'react-select';
import { InputType } from 'reactstrap/es/Input';
import classnames from 'classnames';
import { RecursiveKeyOf } from '../util/firebase/firebase-crud-store';
import { getFirebasePath, getValueByNestedKey } from '../util/firebase/firebase-utils';
import { Gene } from '../model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { connect } from '../util/typed-inject';

export enum RealtimeInputType {
  TEXT = 'text',
  INLINE_TEXT = 'text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
}

interface IRealtimeDropdownInput<T extends Record<string, unknown>> extends SelectProps {
  data: T;
  fieldKey: RecursiveKeyOf<T>;
  labelClass?: string;
  label?: string;
}

export const RealtimeDropdownInput = <T extends Record<string, unknown>>(props: IRealtimeDropdownInput<T>) => {
  const { labelClass, label, ...selectProps } = props;
  return (
    <div>
      {props.label && <Label className={classNames(props.labelClass)}>{props.label}</Label>}
      <Select {...selectProps}></Select>
    </div>
  );
};

export type RealtimeBasicInput = Exclude<RealtimeInputType, RealtimeInputType.DROPDOWN>;

export interface IRealtimeBasicInput extends React.InputHTMLAttributes<HTMLInputElement>, StoreProps {
  data: Gene;
  fieldKey: RecursiveKeyOf<Gene>;
  name: string;
  type: RealtimeBasicInput;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any;
  labelClass?: string;
  label?: string;
  inputClass?: string;
}

export const RealtimeBasicInput = (props: IRealtimeBasicInput) => {
  const {
    name,
    id = name,
    type,
    onChange,
    className,
    labelClass,
    label,
    inputClass,
    children,
    updateReviewableContent,
    ...otherProps
  } = props;

  const firebasePath = getFirebasePath('GENE', props.data.name);
  const isCheckType = type === RealtimeInputType.CHECKBOX || type === RealtimeInputType.RADIO;
  const isInlineInputText = type === RealtimeInputType.INLINE_TEXT;

  const labelComponent = label && (
    <Label id={id} for={id} className={classnames(labelClass, 'text-nowrap')}>
      {label}
    </Label>
  );

  const inputValue = otherProps.value ? otherProps.value : getValueByNestedKey(props.data, props.fieldKey);
  const onInputChange = (e: any) => {
    updateReviewableContent(firebasePath, props.fieldKey, e.target.value);
  };

  const inputComponent = (
    <Input
      className={classNames(inputClass, isCheckType && 'ml-1 position-relative')}
      id={id}
      name={name}
      autoComplete="off"
      onChange={e => {
        onChange ? onChange(e) : onInputChange(e);
      }}
      value={inputValue}
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

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
});

type StoreProps = {
  updateReviewableContent?: (...args: any[]) => void;
};

export default connect(mapStoreToProps)(RealtimeBasicInput);
