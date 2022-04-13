import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
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
        {...attributes}
        {...rest}
      >
        {children}
      </Input>
      {error && <FormFeedback>{error.message}</FormFeedback>}
    </FormGroup>
  );
};

export default ValidatedField;
