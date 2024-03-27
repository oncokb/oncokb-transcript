import { Alert } from 'reactstrap';
import React from 'react';
import { getErrorMessage, OncoKBError } from '../alert/ErrorAlertUtils';

export const ErrorAlert: React.FunctionComponent<{
  error: OncoKBError;
}> = props => {
  return (
    <Alert variant="danger">
      <strong>{getErrorMessage(props.error)}</strong>
    </Alert>
  );
};
