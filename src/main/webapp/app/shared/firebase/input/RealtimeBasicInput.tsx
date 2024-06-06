import { RADIO_OPTION_NONE } from 'app/config/constants/constants';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { default as classNames, default as classnames } from 'classnames';
import { onValue, ref } from 'firebase/database';
import { inject } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { FormFeedback, Input, Label, LabelProps } from 'reactstrap';
import { InputType } from 'reactstrap/types/lib/Input';
import * as styles from './styles.module.scss';

export enum RealtimeInputType {
  TEXT = 'text',
  INLINE_TEXT = 'inline_text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
}

export type RealtimeBasicInputType = Exclude<RealtimeInputType, RealtimeInputType.DROPDOWN>;

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
        {labelIcon && <span className="me-2" />}
        {labelIcon}
      </div>
    </Label>
  );
  return labelComponent;
};

export interface IRealtimeBasicInput extends React.InputHTMLAttributes<HTMLInputElement>, StoreProps {
  firebasePath: string; // firebase path that component needs to listen to
  type: RealtimeBasicInputType;
  label: string;
  invalid?: boolean;
  invalidMessage?: string;
  labelClass?: string;
  labelIcon?: JSX.Element;
  inputClass?: string;
  parseRefs?: boolean;
}

const RealtimeBasicInput: React.FunctionComponent<IRealtimeBasicInput> = (props: IRealtimeBasicInput) => {
  const {
    db,
    firebasePath,
    type,
    onChange,
    className,
    labelClass,
    label,
    labelIcon,
    invalid,
    invalidMessage,
    id = firebasePath,
    inputClass,
    children,
    parseRefs = false,
    updateReviewableContent,
    style,
    ...otherProps
  } = props;

  const [inputValue, setInputValue] = useState(undefined);
  const [inputValueReview, setInputValueReview] = useState<Review>(null);
  const [inputValueUuid, setInputValueUuid] = useState(null);

  const isCheckType = type === RealtimeInputType.CHECKBOX || type === RealtimeInputType.RADIO;
  const isInlineInputText = type === RealtimeInputType.INLINE_TEXT;
  const isTextType = [RealtimeInputType.INLINE_TEXT, RealtimeInputType.TEXT, RealtimeInputType.TEXTAREA].includes(type);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(db, firebasePath), snapshot => {
        setInputValue(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(db, `${firebasePath}_review`), snapshot => {
        setInputValueReview(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(db, `${firebasePath}_uuid`), snapshot => {
        setInputValueUuid(snapshot.val());
      }),
    );
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [firebasePath, db]);

  const labelComponent = label && (
    <RealtimeBasicLabel label={label} labelIcon={labelIcon} id={id} labelClass={isCheckType ? 'mb-0' : 'fw-bold'} />
  );

  const inputChangeHandler = e => {
    let updateValue;
    if (isCheckType) {
      updateValue = e.target.checked && label !== RADIO_OPTION_NONE ? label : '';
    } else {
      updateValue = e.target.value;
    }

    updateReviewableContent(firebasePath, inputValue, updateValue, inputValueReview, inputValueUuid);

    if (onChange) {
      onChange(e);
    }
  };

  function isChecked() {
    if (inputValue) {
      return inputValue === label;
    }
    return label === RADIO_OPTION_NONE;
  }

  const inputStyle = isCheckType ? { marginRight: '0.25rem', ...style } : null;
  const inputComponent = (
    <>
      <Input
        innerRef={inputRef => {
          if (inputRef && type === RealtimeInputType.TEXTAREA) {
            inputRef.style.height = 'auto';
            inputRef.style.height = `${inputRef.scrollHeight}px`;
          }
        }}
        className={classNames(inputClass, isCheckType && 'ms-1 position-relative', isTextType && styles.editableTextBox)}
        id={id}
        name={`${id}-${label.toLowerCase()}`}
        autoComplete="off"
        onChange={e => {
          inputChangeHandler(e);
        }}
        type={props.type as InputType}
        style={inputStyle}
        value={inputValue}
        invalid={invalid}
        checked={isCheckType && isChecked()}
        {...otherProps}
      >
        {children}
      </Input>
      {invalid && <FormFeedback>{invalidMessage || ''}</FormFeedback>}
    </>
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
          <div className={'me-2 d-flex'}>{labelComponent}:</div>
          {inputComponent}
        </div>
      ) : (
        <>
          {labelComponent}
          {inputComponent}
        </>
      )}
      <div className="mt-2">{parseRefs && !!inputValue ? <AutoParseRefField summary={inputValue} /> : undefined}</div>
    </div>
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneReviewService }: IRootStore) => ({
  db: firebaseAppStore.firebaseDb,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(RealtimeBasicInput);
