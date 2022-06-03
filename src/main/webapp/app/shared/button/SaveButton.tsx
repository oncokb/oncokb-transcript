import React from 'react';
import { Button, ButtonProps } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const SaveButton: React.FunctionComponent<ButtonProps & React.HTMLAttributes<HTMLButtonElement>> = props => {
  return (
    <Button color="primary" type="submit" {...props}>
      <FontAwesomeIcon icon="save" />
      <span className="ml-2">Save</span>
    </Button>
  );
};
