import { DEFAULT_ICON_SIZE } from 'app/config/constants/constants';
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

export interface IErrorMessage {
  message: string;
}

export const ErrorMessage = ({ message }: IErrorMessage) => {
  return (
    <div className="error-message">
      <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
      <span>{message}</span>
    </div>
  );
};
