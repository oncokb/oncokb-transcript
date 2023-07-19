import React from 'react';
import { Button, ButtonProps } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import DefaultTooltip from '../tooltip/DefaultTooltip';

export interface CompactButtonProps {
  text: string;
  icon?: IconProp;
  compact?: boolean;
}

const CompactButton: React.FunctionComponent<CompactButtonProps & ButtonProps & React.HTMLAttributes<HTMLButtonElement>> = props => {
  const { text, icon, compact = true, ...buttonProps } = props;

  const button = (
    <Button {...buttonProps}>
      <FontAwesomeIcon icon={props.icon} />
      {!compact ? <span className="ml-2">{props.text}</span> : undefined}
    </Button>
  );
  if (compact) {
    return (
      <DefaultTooltip overlay={props.text} placement="top">
        {button}
      </DefaultTooltip>
    );
  }
  return button;
};

export default CompactButton;
