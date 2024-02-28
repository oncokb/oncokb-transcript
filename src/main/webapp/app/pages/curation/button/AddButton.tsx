import classNames from 'classnames';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'reactstrap';

const AddButton: React.FunctionComponent<{
  onClickHandler: () => void;
  showIcon?: boolean;
  title?: string;
  className?: string;
}> = ({ onClickHandler, showIcon = true, title, className }) => {
  let text = 'Add';
  if (title) {
    text += ` ${title}`;
  }
  return (
    <Button className={classNames('d-flex align-items-center mr-2', className)} color="primary" outline size="sm" onClick={onClickHandler}>
      {showIcon && <FaPlus className="mr-2" />}
      <span>{text}</span>
    </Button>
  );
};

export default AddButton;
