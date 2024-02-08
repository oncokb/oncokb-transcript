import DefaultTooltip, { DefaultTooltipProps } from 'app/shared/tooltip/DefaultTooltip';
import React from 'react';
import { FaPen } from 'react-icons/fa';
import { Button } from 'reactstrap';

export interface IRCTButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltipProps?: Omit<DefaultTooltipProps, 'children'>; // children and disabled supplied by RCT Button
}

export default function RCTButton({ onClick, disabled = false, tooltipProps }: IRCTButtonProps) {
  const buttonComponent = (
    <Button
      style={{ padding: '.125rem .25rem', lineHeight: 1.2, fontSize: '.7rem' }}
      className="d-flex align-items-center"
      size="sm"
      color="primary"
      outline
      disabled={disabled}
      onClick={onClick}
    >
      <FaPen className="mr-1" />
      <span>RCTs</span>
    </Button>
  );

  if (!tooltipProps) {
    return buttonComponent;
  }
  return (
    <DefaultTooltip {...tooltipProps} placement="top">
      {buttonComponent}
    </DefaultTooltip>
  );
}
