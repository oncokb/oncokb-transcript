import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import StateManagedSelect from 'react-select';
import Select from 'react-select';
import { FormFeedback, FormGroup, Input, InputProps, Label } from 'reactstrap';

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

interface IValidatedSelectProps {
  name: string;
  label?: string;
  options: any;
  validate?: RegisterOptions;
  onChange?: any;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
}

export const ValidatedSelect: React.FunctionComponent<IValidatedSelectProps> = ({
  name,
  label,
  validate,
  options,
  isMulti,
  closeMenuOnSelect,
}) => {
  const methods = useFormContext();
  const {
    formState: { errors },
  } = methods;
  const error = errors[name];
  return (
    <FormGroup>
      {label && (
        <Label id={`${name}Label`} for={name}>
          {label}
        </Label>
      )}{' '}
      <Controller
        render={({ field }) => (
          <Select
            {...field}
            styles={{ control: provided => ({ ...provided, borderColor: error ? 'red' : '#ced4da' }) }}
            id={name}
            isMulti={isMulti}
            name={name}
            options={options}
            closeMenuOnSelect={closeMenuOnSelect}
          />
        )}
        name={name}
        rules={validate}
      />
      {error && <FormFeedback>{error.message}</FormFeedback>}
    </FormGroup>
  );
};

export default ValidatedField;
