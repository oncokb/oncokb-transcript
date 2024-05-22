import React from 'react';
import ActionIcon, { IActionIcon } from 'app/shared/icons/ActionIcon';
import { faPen } from '@fortawesome/free-solid-svg-icons';

export default function EditIcon(props: Omit<IActionIcon, 'icon'>) {
  return <ActionIcon {...props} icon={faPen} />;
}
