import React from 'react';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faPen } from '@fortawesome/free-solid-svg-icons';

type SpanProps = JSX.IntrinsicElements['span'];
export default function EditIcon(props: SpanProps) {
  return <ActionIcon {...props} icon={faPen} />;
}
