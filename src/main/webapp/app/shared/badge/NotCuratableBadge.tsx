import React from 'react';
import DefaultBadge from './DefaultBadge';

const NOT_CURATABLE_TOOLTIP_TEXT = {
  stringMutations: 'Each mutation should have its own mutation effect',
  default: 'This mutation cannot have its own mutation effect',
};

export interface INotCuratableBadgeProps {
  mutationName: string;
}

const NotCuratableBadge: React.FunctionComponent<INotCuratableBadgeProps> = (props: INotCuratableBadgeProps) => {
  const { mutationName } = props;
  const text = mutationName?.includes(',') ? NOT_CURATABLE_TOOLTIP_TEXT.stringMutations : NOT_CURATABLE_TOOLTIP_TEXT.default;
  return <DefaultBadge color={'warning'} text={'Not Curatable'} tooltipOverlay={<div>{text}</div>} />;
};

export default NotCuratableBadge;
