import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { DEFAULT_ICON_SIZE } from 'app/config/constants/constants';
import { AsyncSaveButton } from '../button/AsyncSaveButton';

export interface IDefaultAddMutationModal {
  modalBody: JSX.Element;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  confirmButtonDisabled: boolean;
  isConfirmPending?: boolean;
  isUpdate?: boolean;
  errorMessages?: string[];
  warningMessages?: string[];
  modalHeader?: JSX.Element;
}

export const DefaultAddMutationModal = (props: IDefaultAddMutationModal) => {
  return (
    <Modal isOpen id="default-add-mutation-modal" style={{ maxWidth: '550px' }}>
      {props.modalHeader ? <ModalHeader>{props.modalHeader}</ModalHeader> : undefined}
      <ModalBody>
        <div>{props.modalBody}</div>
      </ModalBody>
      <ModalFooter style={{ display: 'inline-block' }}>
        <div className="d-flex justify-content-between">
          <div>
            {props.warningMessages ? (
              <div className="d-flex flex-column justify-content-center">
                {props.warningMessages.map(message => {
                  return (
                    <div key={message} className="warning-message">
                      <FaExclamationTriangle className="me-2" size={DEFAULT_ICON_SIZE} />
                      <div className="d-flex">{message}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div />
            )}
            {props.errorMessages ? (
              <div className="d-flex flex-column justify-content-center">
                {props.errorMessages.map(message => {
                  return (
                    <div key={message} className="error-message">
                      <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} />
                      <div>{message}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div />
            )}
          </div>
          <div className="d-flex align-items-start">
            <Button className="me-2" onClick={props.onCancel} outline color="danger">
              Cancel
            </Button>
            <AsyncSaveButton
              onClick={props.onConfirm}
              disabled={props.confirmButtonDisabled}
              isSavePending={props.isConfirmPending}
              isUpdate={props.isUpdate}
            />
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
