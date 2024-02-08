import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'reactstrap';

const AddMutationButton: React.FunctionComponent<{
  showAddMutationModal: boolean;
  onClickHandler: (show: boolean) => void;
  showIcon?: boolean;
  showFullTitle?: boolean;
}> = ({ showAddMutationModal, onClickHandler, showIcon = true, showFullTitle = false }) => {
  return (
    <Button
      className="d-flex align-items-center mr-2"
      color="primary"
      outline
      size="sm"
      onClick={() => onClickHandler(showAddMutationModal)}
    >
      {showIcon && <FaPlus className="mr-2" />}
      <span>{showFullTitle ? 'Add Mutation' : 'Add'}</span>
    </Button>
  );
};

export default AddMutationButton;
