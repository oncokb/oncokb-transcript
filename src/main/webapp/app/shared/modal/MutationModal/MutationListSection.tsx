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
              overlayInnerStyle={{ minWidth: '400px' }}
              overlay={
                <Input
                  type="textarea"
                  placeholder={'Input string name comment'}
                  value={alterationCategoryComment}
                  onChange={event => setAlterationCategoryComment?.(event.target.value)}
                />
              }
            >
              <FontAwesomeIcon
                icon={alterationCategoryComment === '' ? farComment : fasComment}
                color={alterationCategoryComment === '' ? 'inherit' : 'green'}
              />
            </DefaultTooltip>
          </div>
        )}
      </div>
      <div className="px-2 py-2">
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
