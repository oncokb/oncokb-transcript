import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalProps, Spinner } from 'reactstrap';
import { AsyncSaveButton } from '../button/AsyncSaveButton';
import { SIMPLE_CONFIRM_MODAL_CONTENT_ID } from 'app/config/constants/html-id';

export interface ISimpleConfirmModal extends ModalProps {
  title?: string;
  hideTitle?: boolean;
  body?: string | JSX.Element;
  show: boolean;
  cancelText?: string;
  cancelColor?: string;
  cancelIcon?: IconProp;
  confirmText?: string;
  confirmColor?: string;
  confirmIcon?: IconProp;
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  showConfirmLoader?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const SimpleConfirmModal = ({
  title,
  hideTitle,
  body,
  show,
  cancelText,
  cancelColor,
  cancelIcon,
  confirmText,
  confirmColor,
  confirmIcon,
  confirmDisabled,
  onConfirm,
  showConfirmLoader,
  style,
  id,
  ...modalProps
}: ISimpleConfirmModal) => {
  const onCancel = (event?: any) => {
    if (event) event.preventDefault();
    if (modalProps.onCancel) modalProps.onCancel();
  };
  return (
    <Modal style={style} isOpen={show} toggle={() => onCancel()} id={id} {...modalProps}>
      <div data-testid={SIMPLE_CONFIRM_MODAL_CONTENT_ID}>
        {!hideTitle && <ModalHeader toggle={() => onCancel()}>{title || 'Please confirm'}</ModalHeader>}
        <ModalBody>{body ? body : 'Are you sure?'}</ModalBody>
        <ModalFooter>
          <Button color={cancelColor || 'secondary'} onClick={(event: any) => onCancel(event)}>
            {cancelIcon && (
              <>
                <FontAwesomeIcon icon={cancelIcon} /> &nbsp;
              </>
            )}{' '}
            {cancelText || 'Cancel'}
          </Button>
          <AsyncSaveButton
            disabled={confirmDisabled}
            color={confirmColor || 'primary'}
            onClick={(event: any) => {
              event.preventDefault();
              if (onConfirm) onConfirm();
            }}
            icon={confirmIcon}
            confirmText={confirmText}
            isSavePending={showConfirmLoader}
          />
        </ModalFooter>
      </div>
    </Modal>
  );
};
