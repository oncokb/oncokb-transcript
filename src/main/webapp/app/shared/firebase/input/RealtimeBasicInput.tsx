import { RADIO_OPTION_NONE } from 'app/config/constants/constants';
import { AutoParseRefField } from 'app/shared/form/AutoParseRefField';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { default as classNames, default as classnames } from 'classnames';
import { onValue, ref } from 'firebase/database';
import { inject } from 'mobx-react';
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { FormFeedback, Input, Label, LabelProps } from 'reactstrap';
import { InputType } from 'reactstrap/types/lib/Input';
import * as styles from './styles.module.scss';
import { Unsubscribe } from 'firebase/database';
import { useTextareaAutoHeight } from 'app/hooks/useTextareaAutoHeight';

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
  labelOnClick?: MouseEventHandler<HTMLLabelElement>;
  invalid?: boolean;
  invalidMessage?: string;
  labelClass?: string;
  labelIcon?: JSX.Element;
  inputClass?: string;
  parseRefs?: boolean;
  updateMetaData?: boolean;
  disabledMessage?: string;
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
    updateMetaData,
    placeholder,
    disabled,
    disabledMessage,
    onMouseDown,
    labelOnClick,
    ...otherProps
  } = props;

  const [inputValue, setInputValue] = useState(undefined);
  const [inputValueReview, setInputValueReview] = useState<Review | null>(null);
  const [inputValueLoaded, setInputValueLoaded] = useState(false);
  const [inputValueUuid, setInputValueUuid] = useState(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const isCheckType = type === RealtimeInputType.CHECKBOX || type === RealtimeInputType.RADIO;
  const isInlineInputText = type === RealtimeInputType.INLINE_TEXT;
  const isTextType = [RealtimeInputType.INLINE_TEXT, RealtimeInputType.TEXT, RealtimeInputType.TEXTAREA].includes(type);

  useEffect(() => {
    if (!db) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(db, firebasePath), snapshot => {
        setInputValue(snapshot.val());
        setInputValueLoaded(true);
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

  useTextareaAutoHeight(inputRef, type);

  const labelComponent = label && (
    <RealtimeBasicLabel label={label} labelIcon={labelIcon} id={id} labelClass={isCheckType ? 'mb-0' : 'fw-bold'} onClick={labelOnClick} />
  );

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let updateValue: string;
    if (isCheckType) {
      updateValue = e.target.checked && label !== RADIO_OPTION_NONE ? label : '';
    } else {
      updateValue = e.target.value;
    }

    updateReviewableContent?.(firebasePath, inputValue, updateValue, inputValueReview, inputValueUuid, updateMetaData);

    if (onChange) {
      onChange(e);
    }

    const input = inputRef.current;
    if (type === RealtimeInputType.TEXTAREA && input) {
      resizeTextArea(input);
    }
  };

  function isChecked() {
    if (inputValue) {
      return inputValue === label;
    }
    return label === RADIO_OPTION_NONE;
  }

  function resizeTextArea(textArea: HTMLInputElement | HTMLTextAreaElement) {
    textArea.style.height = 'auto';
    textArea.style.height = `${textArea.scrollHeight}px`;
  }

  const inputStyle: React.CSSProperties | undefined = isCheckType ? { marginRight: '0.25rem', ...style } : undefined;
  const inputComponent = (
    <>
      <Input
        innerRef={inputRef}
        className={classNames(inputClass, isCheckType && 'ms-1 position-relative', isTextType && !props.disabled && styles.editableTextBox)}
        id={id}
        name={`${id}-${label.toLowerCase()}`}
        autoComplete="off"
        onChange={e => {
          inputChangeHandler(e);
        }}
        onMouseDown={onMouseDown}
        type={props.type as InputType}
        style={inputStyle}
        value={inputValue}
        invalid={invalid}
        checked={isCheckType && isChecked()}
        disabled={disabled}
        placeholder={placeholder ? placeholder : disabled && disabledMessage ? disabledMessage : ''}
        {...otherProps}
      >
        {children}
      </Input>
      {disabled && disabledMessage && inputValue && <div className={'text-danger'}>{disabledMessage}</div>}
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
