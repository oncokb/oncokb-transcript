import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import styles from './styles.module.scss';

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
            <div className={styles.warning}>
              <div>
                <FaExclamationCircle className="mr-2" size={'25px'} />
              </div>
              <div>{props.warningMessage}</div>
            </div>
          ) : (
            <div />
          )}
          <div className="d-flex align-items-start">
            <Button className="mr-2" onClick={props.onCancel} outline color="danger">
              Cancel
            </Button>
            <Button onClick={props.onConfirm} color="primary" disabled={props.confirmButtonDisabled}>
              {props.isUpdate ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
