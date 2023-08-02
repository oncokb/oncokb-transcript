import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export const SimpleConfirmModal: React.FunctionComponent<{
  title?: string;
  body?: string | JSX.Element;
  show: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}> = props => {
  const onCancel = (event?: any) => {
    if (event) event.preventDefault();
    if (props.onCancel) props.onCancel();
  };
  return (
    <Modal isOpen={props.show} toggle={() => onCancel()}>
      <ModalHeader toggle={() => onCancel()}>{props.title || 'Please confirm'}</ModalHeader>
      <ModalBody>{props.body ? props.body : 'Are you sure?'}</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={(event: any) => onCancel(event)}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={(event: any) => {
            event.preventDefault();
            if (props.onConfirm) props.onConfirm();
          }}
        >
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  );
};
