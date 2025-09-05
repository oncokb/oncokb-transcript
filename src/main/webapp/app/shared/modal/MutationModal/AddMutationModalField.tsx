import React from 'react';
import { useTextareaAutoHeight } from 'app/hooks/useTextareaAutoHeight';
import { useRef } from 'react';
import { Col, Row, Spinner } from 'reactstrap';
import classNames from 'classnames';
import { InputType } from 'reactstrap/types/lib/Input';
import { Input } from 'reactstrap';

interface IAddMutationModalFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (newValue: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  type?: InputType;
}

const AddMutationModalField = ({ label, value: value, placeholder, onChange, isLoading, disabled, type }: IAddMutationModalFieldProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useTextareaAutoHeight(inputRef, type);

  return (
    <Row className="d-flex align-items-center mb-3 g-0">
      <Col className="px-0 col-3 me-3 align-items-center">
        <span className="me-2">{label}</span>
        {isLoading && <Spinner color="primary" size="sm" />}
      </Col>
      <Col className="px-0">
        <Input
          innerRef={inputRef}
          disabled={disabled}
          value={value}
          onChange={event => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
          type={type}
          className={classNames(type === 'textarea' ? 'alteration-modal-textarea-field' : undefined)}
        />
      </Col>
    </Row>
  );
};

export default AddMutationModalField;
