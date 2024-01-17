import React from 'react';
import { IconBaseProps } from 'react-icons';
import { FaEdit } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';

export default function EditIcon(props: IconBaseProps) {
  return (
    <IconContext.Provider value={{ style: { cursor: 'pointer' } }}>
      <div>
        <FaEdit {...props} />
      </div>
    </IconContext.Provider>
  );
}
