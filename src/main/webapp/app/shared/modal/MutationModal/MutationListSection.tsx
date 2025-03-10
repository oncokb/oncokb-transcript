import React, { useMemo } from 'react';
import { IRootStore } from 'app/stores';
import { componentInject } from '../../util/typed-inject';
import { getFullAlterationName } from '../../util/utils';
import DefaultTooltip from '../../tooltip/DefaultTooltip';
import { Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import { faComment as fasComment } from '@fortawesome/free-solid-svg-icons';
import AlterationCategoryInputs from './AlterationCategoryInputs';
import AlterationBadgeList from './AlterationBadgeList';
import { ADD_MUTATION_MODAL_FLAG_COMMENT_ID, ADD_MUTATION_MODAL_FLAG_COMMENT_INPUT_ID } from 'app/config/constants/html-id';

const MutationListSection = ({
  alterationStates,
  alterationCategoryComment,
  setAlterationCategoryComment,
  selectedAlterationCategoryFlags,
}: StoreProps) => {
  const showAlterationCategoryDropdown = (alterationStates ?? []).length > 1;
  const showAlterationCategoryComment = showAlterationCategoryDropdown && (selectedAlterationCategoryFlags ?? []).length > 0;

  const finalMutationName = useMemo(() => {
    return alterationStates
      ?.map(alterationState => {
        const altName = getFullAlterationName(alterationState, false);
        return altName;
      })
      .join(', ');
  }, [alterationStates]);

  return (
    <>
      <div className="d-flex">
        <div className="h5">Current Mutation List</div>
        {showAlterationCategoryComment && (
          <div className="ms-2">
            <DefaultTooltip
              destroyTooltipOnHide
              mouseLeaveDelay={0.5}
              overlayInnerStyle={{ minWidth: '400px' }}
              overlay={
                <Input
                  id={ADD_MUTATION_MODAL_FLAG_COMMENT_INPUT_ID}
                  type="textarea"
                  placeholder={'Input string name comment'}
                  value={alterationCategoryComment}
                  onChange={event => setAlterationCategoryComment?.(event.target.value)}
                />
              }
            >
              <FontAwesomeIcon
                id={ADD_MUTATION_MODAL_FLAG_COMMENT_ID}
                icon={alterationCategoryComment === '' ? farComment : fasComment}
                color={alterationCategoryComment === '' ? 'inherit' : 'green'}
              />
            </DefaultTooltip>
          </div>
        )}
      </div>
      <div className="py-2">
        {showAlterationCategoryDropdown && <AlterationCategoryInputs />}
        <AlterationBadgeList />
        <div className="text-muted mt-1">Name preview: {finalMutationName}</div>
      </div>
    </>
  );
};

const mapStoreToProps = ({ addMutationModalStore }: IRootStore) => ({
  alterationStates: addMutationModalStore.alterationStates,
  setShowModifyExonForm: addMutationModalStore.setShowModifyExonForm,
  alterationCategoryComment: addMutationModalStore.alterationCategoryComment,
  selectedAlterationCategoryFlags: addMutationModalStore.selectedAlterationCategoryFlags,
  setAlterationStates: addMutationModalStore.setAlterationStates,
  setAlterationCategoryComment: addMutationModalStore.setAlterationCategoryComment,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(MutationListSection);
