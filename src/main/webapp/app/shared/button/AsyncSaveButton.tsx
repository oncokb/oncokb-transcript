import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, ButtonProps, Spinner } from 'reactstrap';

export interface IAsyncSaveButtonProps extends ButtonProps {
  id?: string;
  icon?: IconProp;
  isUpdate?: boolean;
  confirmText?: string;
  isSavePending?: boolean;
}

export const AsyncSaveButton = ({ icon, isUpdate, confirmText, isSavePending, disabled, ...rest }: IAsyncSaveButtonProps) => {
  const getConfirmText = () => {
    if (confirmText) return confirmText;
    return isUpdate ? 'Update' : 'Confirm';
  };
  return (
    <Button disabled={disabled} color="primary" {...rest}>
      {icon && (
        <span className="me-2">
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      {getConfirmText()}
      {isSavePending && <Spinner size="sm" className="ms-2" />}
    </Button>
  );
};
