import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ERROR_EXCLAMATION_ICON_SIZE } from 'app/config/constants/constants';

export interface IDefaultAddMutationModal {
  modalBody: JSX.Element;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonDisabled: boolean;
  isUpdate?: boolean;
  warningMessages?: string[];
  modalHeader?: JSX.Element;
}

export const DefaultAddMutationModal = (props: IDefaultAddMutationModal) => {
  return (
    <Modal isOpen>
      {props.modalHeader ? <ModalHeader>{props.modalHeader}</ModalHeader> : undefined}
      <ModalBody>
        <div>{props.modalBody}</div>
      </ModalBody>
      <ModalFooter style={{ display: 'inline-block' }}>
        <div className="d-flex justify-content-between">
          {props.warningMessages ? (
            <div className="d-flex flex-column justify-content-center">
              {props.warningMessages.map(message => {
                return (
                  <div key={message} className="error-message">
                    <FaExclamationCircle className="mr-2" size={ERROR_EXCLAMATION_ICON_SIZE} />
                    <div>{message}</div>
                  </div>
                );
              })}
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
