import React from 'react';
import ReactSelect, { MenuPlacement } from 'react-select';
import { Col } from 'reactstrap';

export type DropdownOption = {
  label: string;
  value: any;
};

export interface IAddMutationModalDropdownProps {
  label: string;
  value: DropdownOption;
  options: DropdownOption[];
  menuPlacement?: MenuPlacement;
  onChange: (newValue: DropdownOption | null) => void;
}

const AddMutationModalDropdown = ({ label, value, options, menuPlacement, onChange }: IAddMutationModalDropdownProps) => {
  return (
    <div className="d-flex align-items-center mb-3">
      <Col className="px-0 col-3 me-3">
        <span>{label}</span>
      </Col>
      <Col className="px-0">
        <ReactSelect value={value} options={options} onChange={onChange} menuPlacement={menuPlacement} isClearable />
      </Col>
    </div>
  );
};

export default AddMutationModalDropdown;
