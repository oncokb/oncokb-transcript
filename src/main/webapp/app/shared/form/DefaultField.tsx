import React from 'react';
import { FormGroup, Input, InputProps, Label } from 'reactstrap';

interface IDefaultFieldProps extends InputProps {
  name: string;
  label?: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  onChange?: any;
}

export const DefaultField: React.FunctionComponent<IDefaultFieldProps> = ({
  name,
  id = name,
  children,
  label,
  className,
  labelClass,
  inputClass,
  onChange,
  type,
  ...attributes
}) => {
  return (
    <FormGroup className={className}>
      {label && (
        <Label id={`${name}Label`} for={id} className={labelClass}>
          {label}
        </Label>
      )}
      <Input
        className={inputClass}
        id={id}
        name={name}
        autoComplete="off"
        onChange={e => {
          onChange && onChange(e);
        }}
        type={type}
        style={type === 'checkbox' ? { marginLeft: '0.25rem' } : null}
        {...attributes}
      >
        {children}
      </Input>
    </FormGroup>
  );
};
