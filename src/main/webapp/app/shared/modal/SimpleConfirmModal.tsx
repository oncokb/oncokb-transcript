import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export const SimpleConfirmModal: React.FunctionComponent<{
  title?: string;
  body?: string | JSX.Element;
  show: boolean;
  cancelText?: string;
  cancelColor?: string;
  cancelIcon?: IconProp;
  confirmText?: string;
  confirmColor?: string;
  confirmIcon?: IconProp;
  confirmDisabled?: boolean;
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
        <Button color={props.cancelColor || 'secondary'} onClick={(event: any) => onCancel(event)}>
          {props.cancelIcon && (
            <>
              <FontAwesomeIcon icon={props.cancelIcon} /> &nbsp;
            </>
          )}{' '}
          {props.cancelText || 'Cancel'}
        </Button>
        <Button
          disabled={props.confirmDisabled}
          color={props.confirmColor || 'primary'}
          onClick={(event: any) => {
            event.preventDefault();
            if (props.onConfirm) props.onConfirm();
          }}
        >
          {props.confirmIcon && (
            <>
              <FontAwesomeIcon icon={props.confirmIcon} /> &nbsp;
            </>
          )}{' '}
          {props.confirmText || 'Confirm'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
