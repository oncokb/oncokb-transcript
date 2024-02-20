import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { Input, Label, LabelProps, Row } from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import classnames from 'classnames';
import { ExtractPathExpressions } from '../../util/firebase/firebase-crud-store';
import { Gene } from '../../model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { RealtimeInputType } from './FirebaseRealtimeInput';
import { inject } from 'mobx-react';
import { getFirebasePath, getValueByNestedKey } from 'app/shared/util/firebase/firebase-utils';
import _ from 'lodash';

export interface IRealtimeBasicLabel extends LabelProps {
  id: string;
  label: string;
  labelClass?: string;
  labelIcon?: JSX.Element;
}
export const RealtimeBasicLabel: React.FunctionComponent<IRealtimeBasicLabel> = ({
  label,
  labelClass,
  labelIcon,
  id,
  ...labelProps
}: IRealtimeBasicLabel) => {
  const labelComponent = (
    <Label {...labelProps} id={id} for={id} className={classnames(labelClass, 'text-nowrap')}>
      <div className="d-flex align-items-center">
        {label}
        {labelIcon && <span className="mr-2" />}
        {labelIcon}
      </div>
    </Label>
  );
  return labelComponent;
};

export type RealtimeBasicInput = Exclude<RealtimeInputType, RealtimeInputType.DROPDOWN>;

export interface IRealtimeBasicInput extends React.InputHTMLAttributes<HTMLInputElement>, StoreProps {
  fieldKey: ExtractPathExpressions<Gene>;
  type: RealtimeBasicInput;
  label: string;
  labelClass?: string;
  labelIcon?: JSX.Element;
  inputClass?: string;
}

const RealtimeBasicInput: React.FunctionComponent<IRealtimeBasicInput> = (props: IRealtimeBasicInput) => {
  const {
    fieldKey,
    type,
    onChange,
    className,
    labelClass,
    label,
    labelIcon,
    id = fieldKey,
    inputClass,
    children,
    data,
    updateReviewableContent,
    ...otherProps
  } = props;

  const isCheckType = type === RealtimeInputType.CHECKBOX || type === RealtimeInputType.RADIO;
  const isInlineInputText = type === RealtimeInputType.INLINE_TEXT;

  const labelComponent = label && (
    <RealtimeBasicLabel label={label} labelIcon={labelIcon} id={id} labelClass={isCheckType ? 'mb-0' : 'font-weight-bold'} />
  );

  const inputValue = getValueByNestedKey(data, fieldKey);
  const inputChangeHandler = e => {
    const updateValue = isCheckType ? (e.target.checked ? label : '') : e.target.value;
    updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, updateValue);
    if (onChange) {
      onChange(e);
    }
  };

  const inputComponent = (
    <Input
      className={classNames(inputClass, isCheckType && 'ml-1 position-relative')}
      id={id}
      name={`${id}-${label.toLowerCase()}`}
      autoComplete="off"
      onChange={e => {
        inputChangeHandler(e);
      }}
      type={props.type as InputType}
      style={isCheckType ? { marginRight: '0.25rem' } : null}
      value={inputValue}
      checked={isCheckType && getValueByNestedKey(data, fieldKey) === label}
      {...otherProps}
    >
      {children}
    </Input>
  );

  const checkTypeCss: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div className={classNames(!isCheckType ? 'mb-2' : undefined, className)} style={isCheckType ? checkTypeCss : undefined}>
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
  data: firebaseGeneStore.data,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
});

type StoreProps = {
  data?: Readonly<Gene>;
  updateReviewableContent?: (path: string, key: ExtractPathExpressions<Gene>, value: any) => void;
};

export default inject(mapStoreToProps)(RealtimeBasicInput);
