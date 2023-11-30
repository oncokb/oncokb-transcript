import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import React, { useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

export interface DeleteSectionButtonProps {
  sectionName: string;
  deleteHandler: () => void;
  isRemoveableWithoutReview: boolean;
}

export const DeleteSectionButton = (props: DeleteSectionButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
        <FaRegTrashAlt size={16} />
      </span>
      <SimpleConfirmModal
        title={'Are you sure you want to delete this section?'}
        body={
          <>
            <div>
              You are deleting the section <b>{props.sectionName}</b> and all underlying section(s).
            </div>
            {props.isRemoveableWithoutReview ? (
              <div className="mt-2 text-danger">
                This section will be removed immediately since it is newly added and has not been reviewed yet.
              </div>
            ) : (
              <div className="mt-2 text-warning">This deletion will need to be reviewed before it is fully removed from our system.</div>
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
