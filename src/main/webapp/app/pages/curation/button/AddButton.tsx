import classNames from 'classnames';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'reactstrap';

const AddButton: React.FunctionComponent<{
  onClickHandler: () => void;
  showIcon?: boolean;
  title?: string;
  disabled?: boolean;
  className?: string;
}> = ({ onClickHandler, showIcon = true, title, disabled, className }) => {
  let text = 'Add';
  if (title) {
    text += ` ${title}`;
  }
  return (
    <Button
      className={classNames('d-flex align-items-center me-2', className)}
      color="primary"
      outline
      disabled={disabled}
      size="sm"
      onClick={onClickHandler}
    >
      {showIcon && <FaPlus className="me-2" />}
      <span>{text}</span>
    </Button>
  );
};

export default AddButton;
