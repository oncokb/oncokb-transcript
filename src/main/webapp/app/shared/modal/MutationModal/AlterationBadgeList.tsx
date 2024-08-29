import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import * as styles from './styles.module.scss';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AlterationData } from '../NewAddMutationModal';
import { getFullAlterationName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import { faComment as fasComment } from '@fortawesome/free-solid-svg-icons';
import AlterationCategoryInputs from './AlterationCategoryInputs';
import { Input } from 'reactstrap';
import { useOverflowDetector } from 'app/hooks/useOverflowDetector';

export interface IAlterationBadgeList extends StoreProps {
  alterationData: AlterationData[];
}

const AlterationBadgeList = ({
  alterationStates,
  alterationCategoryComment,
  setAlterationStates,
  selectedAlterationStateIndex,
  setSelectedAlterationStateIndex,
  setAlterationCategoryComment,
  selectedAlterationCategoryFlags,
}: StoreProps) => {
  useEffect(() => {
    if (!alterationStates) return;
    if ((selectedAlterationStateIndex ?? -1) >= alterationStates.length) {
      setSelectedAlterationStateIndex?.(alterationStates.length - 1);
    }
  }, [alterationStates?.length, selectedAlterationStateIndex]);

  const showAlterationCategoryDropdown = (alterationStates ?? []).length > 1;
  const showAlterationCategoryComment = showAlterationCategoryDropdown && (selectedAlterationCategoryFlags ?? []).length > 0;

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
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '0.25rem', display: 'flex', flexWrap: 'wrap' }}>
          {alterationStates?.map((value, index) => {
            const fullAlterationName = getFullAlterationName(value, false);
            return (
              <AlterationBadge
                key={fullAlterationName}
                alterationData={value}
                alterationName={fullAlterationName}
                isSelected={index === selectedAlterationStateIndex}
                onClick={() => setSelectedAlterationStateIndex?.(index)}
                onDelete={() => {
                  setAlterationStates?.(
                    alterationStates.filter(alterationState => getFullAlterationName(value) !== getFullAlterationName(alterationState)),
                  );
                }}
              />
            );
          })}
        </div>
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
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  setSelectedAlterationStateIndex: addMutationModalStore.setSelectedAlterationStateIndex,
  setAlterationCategoryComment: addMutationModalStore.setAlterationCategoryComment,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AlterationBadgeList);

interface IAlterationBadge {
  alterationData: AlterationData;
  alterationName: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const AlterationBadge = ({ alterationData, alterationName, isSelected, onClick, onDelete }: IAlterationBadge) => {
  const { ref, overflow } = useOverflowDetector({ handleHeight: false });

  function getBackgroundColor() {
    if (alterationData.error) {
      return 'danger';
    }
    if (alterationData.warning) {
      return 'warning';
    }
    return 'success';
  }

  function getStatusIcon() {
    if (alterationData.error) {
      return <FaExclamationCircle className="text-danger me-1" />;
    }
    if (alterationData.warning) {
      <FaExclamationTriangle className="text-danger me-1" />;
    }
    return <></>;
  }

  const badgeComponent = (
    <div
      key={alterationName}
      className={classNames('badge mx-1 my-1', `badge-outline-${getBackgroundColor()}`, styles.alterationBadge, isSelected && 'active')}
    >
      <div className={styles.alterationBadgeName} onClick={onClick}>
        {/* {getStatusIcon()} */}
        <div
          ref={ref}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          {alterationName}
        </div>
      </div>
      <div className={styles.actionWrapper}>
        <FontAwesomeIcon icon={faXmark} className={styles.deleteButton} onClick={onDelete} />
      </div>
    </div>
  );

  if (overflow) {
    return (
      <DefaultTooltip overlay={alterationName} placement="bottom">
        {badgeComponent}
      </DefaultTooltip>
    );
  }

  return badgeComponent;
};
