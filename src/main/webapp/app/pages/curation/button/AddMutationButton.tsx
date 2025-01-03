import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'reactstrap';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';

export interface IAddMutationButtonProps extends StoreProps {
  showAddMutationModal: boolean;
  onClickHandler: (show: boolean) => void;
  showIcon?: boolean;
  showFullTitle?: boolean;
}

const AddMutationButton: React.FunctionComponent<IAddMutationButtonProps> = ({
  showAddMutationModal,
  onClickHandler,
  showIcon = true,
  showFullTitle = false,
  readOnly,
}) => {
  return (
    <Button
      disabled={readOnly}
      className="d-flex align-items-center me-2"
      color="primary"
      outline
      size="sm"
      onClick={() => onClickHandler(showAddMutationModal)}
    >
      {showIcon && <FaPlus className="me-2" />}
      <span>{showFullTitle ? 'Add Mutation' : 'Add'}</span>
    </Button>
  );
};

const mapStoreToProps = ({ curationPageStore }: IRootStore) => ({
  readOnly: curationPageStore.readOnly,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(AddMutationButton));
