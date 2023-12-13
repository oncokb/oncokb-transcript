import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import React, { useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

export interface DeleteSectionButtonProps {
  sectionName: string;
  deleteHandler: () => void;
  isRemovableWithoutReview: boolean;
}

export const DeleteSectionButton = (props: DeleteSectionButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <span style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
        <FaRegTrashAlt size={16} />
      </span>
      <SimpleConfirmModal
        title={'Are you sure you want to delete this section?'}
        body={
          <>
            <div>
              You are deleting the section <b>{props.sectionName}</b> and all underlying section(s).
            </div>
            {props.isRemovableWithoutReview ? (
              <div className="mt-2">This section will be removed immediately since it is newly added and has not been reviewed yet.</div>
            ) : (
              <div className="mt-2">This deletion will need to be reviewed before it is fully removed from our system.</div>
            )}
          </>
        }
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          props.deleteHandler();
          setShowModal(false);
        }}
        show={showModal}
      />
    </>
  );
};
