import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { GroupBase, Props } from 'react-select';
import Select from 'react-select';
import { FormFeedback, FormGroup, Input, InputProps, Label } from 'reactstrap';
import './validated-select.scss';

interface IValidatedFieldProps extends InputProps {
  name: string;
  label?: string;
  validate?: RegisterOptions;
  onChange?: any;
}

export const ValidatedField: React.FunctionComponent<IValidatedFieldProps> = ({
  name,
  id = name,
  children,
  label,
  validate,
  onChange,
  type,
  ...attributes
}) => {
  const methods = useFormContext();
  const {
    register,
    formState: { errors },
  } = methods;
  const { ref, onChange: onChangeValidate, ...rest } = register(name, validate);
  const error = errors[name];
  return (
    <FormGroup>
      {label && (
        <Label id={`${name}Label`} for={id}>
          {label}
        </Label>
      )}
      <Input
        id={id}
        name={name}
        autoComplete="off"
        innerRef={ref}
        invalid={!!error}
        onChange={e => {
          void onChangeValidate(e);
          onChange && onChange(e);
        }}
        type={type}
        style={type === 'checkbox' ? { marginLeft: '0.25rem' } : null}
        {...attributes}
        {...rest}
      >
        {children}
      </Input>
      {error && <FormFeedback>{error.message}</FormFeedback>}
    </FormGroup>
  );
};

export type IValidatedSelectProps<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>> = Props<
  Option,
  IsMulti,
  Group
> & {
  name: string;
  label?: string;
  validate?: RegisterOptions;
};
export const ValidatedSelect = <Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  props: IValidatedSelectProps<Option, IsMulti, Group>
) => {
  const {
    formState: { errors },
  } = useFormContext();

  const { name, label, validate, ...selectProps } = props;

  const error = errors[props.name];

  return (
    <FormGroup>
      {props.label && (
        <Label id={`${props.name}Label`} for={props.name}>
          {props.label}
        </Label>
      )}
      <Controller
        render={({ field }) => (
          <Select
            className={`${error ? 'react-select-invalid' : ''}`}
            classNamePrefix={'react-select'}
            {...field}
            {...selectProps}
            id={props.name}
          />
        )}
        name={props.name}
        rules={props.validate}
      />
      {error && <FormFeedback>{error.message}</FormFeedback>}
    </FormGroup>
  );
};
