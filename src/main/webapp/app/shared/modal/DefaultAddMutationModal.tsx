import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { ERROR_EXCLAMATION_ICON_SIZE } from 'app/config/constants/constants';

export interface IDefaultAddMutationModal {
  modalBody: JSX.Element;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonDisabled: boolean;
  isUpdate?: boolean;
  warningMessage?: string;
}

export const DefaultAddMutationModal = (props: IDefaultAddMutationModal) => {
  return (
    <Modal isOpen>
      <ModalBody>
        <div>{props.modalBody}</div>
      </ModalBody>
      <ModalFooter style={{ display: 'inline-block' }}>
        <div className="d-flex justify-content-between">
          {props.warningMessage ? (
            <div className="error-message">
              <FaExclamationCircle className="mr-2" size={ERROR_EXCLAMATION_ICON_SIZE} />
              <div>{props.warningMessage}</div>
            </div>
          ) : (
            <div />
          )}
          <div className="d-flex align-items-start">
            <Button className="mr-2" onClick={props.onCancel} outline color="danger">
              Cancel
            </Button>
            <Button
              onClick={props.onConfirm}
              disabled={props.confirmButtonDisabled}
              color={props.confirmButtonDisabled ? 'secondary' : 'primary'}
            >
              {props.isUpdate ? 'Update' : 'Confirm'}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
