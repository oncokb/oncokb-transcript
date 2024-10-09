import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import React from 'react';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input } from 'reactstrap';

export interface IInputFieldIcon {
  icon: IconDefinition;
  onInputChange: () => {};
  inputPlaceholder: string;
}

const InputFieldIcon = ({ icon, onInputChange, inputPlaceholder }: IInputFieldIcon) => {
  return (
    <DefaultTooltip overlay={<Input placeholder={inputPlaceholder} onChange={onInputChange}></Input>}>
      <FontAwesomeIcon icon={icon} />
    </DefaultTooltip>
  );
};
