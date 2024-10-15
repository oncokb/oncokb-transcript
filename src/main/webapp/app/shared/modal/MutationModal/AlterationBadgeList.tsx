import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import React, { useMemo, useRef, useState } from 'react';
import * as styles from './styles.module.scss';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AlterationData } from '../AddMutationModal';
import { getFullAlterationName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useOverflowDetector } from 'app/hooks/useOverflowDetector';
import { BS_BORDER_COLOR } from 'app/config/colors';
import _ from 'lodash';
import { DEFAULT_ICON_SIZE } from 'app/config/constants/constants';
import { FaCircleCheck } from 'react-icons/fa6';

export interface IAlterationBadgeList extends StoreProps {
  isExclusionList?: boolean;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (newValue: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<Element>) => void;
}

const AlterationBadgeList = ({
  alterationStates,
  setAlterationStates,
  selectedAlterationStateIndex,
  setSelectedAlterationStateIndex,
  selectedExcludedAlterationIndex,
  setSelectedExcludedAlterationIndex,
  onInputChange,
  inputValue,
  isExclusionList = false,
  showInput = false,
}: IAlterationBadgeList) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  if (alterationStates === undefined || selectedAlterationStateIndex === undefined) return <></>;

  const alterationList = isExclusionList ? alterationStates[selectedAlterationStateIndex].excluding : alterationStates;

  const handleAlterationDelete = (value: AlterationData) => {
    const filteredAlterationList = alterationList?.filter(
      alterationState => getFullAlterationName(value) !== getFullAlterationName(alterationState),
    );
    if (!isExclusionList) {
      setAlterationStates?.(filteredAlterationList);
    } else {
      const newAlterationStates = _.cloneDeep(alterationStates);
      newAlterationStates[selectedAlterationStateIndex].excluding = newAlterationStates[selectedAlterationStateIndex].excluding.filter(
        state => getFullAlterationName(value) !== getFullAlterationName(state),
      );
      setAlterationStates?.(newAlterationStates);
    }
  };

  const handleAlterationClick = (index: number) => {
    isExclusionList ? setSelectedExcludedAlterationIndex?.(index) : setSelectedAlterationStateIndex?.(index);
  };

  return (
    <div
      style={{
        border: `1px solid ${BS_BORDER_COLOR}`,
        borderRadius: '5px',
        padding: '0.25rem',
        display: 'flex',
        flexWrap: 'wrap',
      }}
      onClick={() => inputRef?.current?.focus()}
    >
      {alterationList?.map((value, index) => {
        const fullAlterationName = getFullAlterationName(value, false);
        return (
          <AlterationBadge
            key={fullAlterationName}
            alterationData={value}
            alterationName={fullAlterationName}
            isSelected={index === (isExclusionList ? selectedExcludedAlterationIndex : selectedAlterationStateIndex)}
            onClick={() => handleAlterationClick(index)}
            onDelete={() => handleAlterationDelete(value)}
            isExludedAlteration={isExclusionList}
          />
        );
      })}
      {showInput && (
        <div className={styles.alterationBadgeListInputWrapper}>
          <input
            ref={inputRef}
            className={styles.alterationBadgeListInput}
            onChange={event => onInputChange?.(event.target.value)}
            placeholder={alterationList.length > 0 ? undefined : 'Enter alteration(s)'}
            value={inputValue}
          ></input>
        </div>
      )}
    </div>
  );
};

const mapStoreToProps = ({ addMutationModalStore }: IRootStore) => ({
  alterationStates: addMutationModalStore.alterationStates,
  setAlterationStates: addMutationModalStore.setAlterationStates,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  setSelectedAlterationStateIndex: addMutationModalStore.setSelectedAlterationStateIndex,
  selectedExcludedAlterationIndex: addMutationModalStore.selectedExcludedAlterationIndex,
  setSelectedExcludedAlterationIndex: addMutationModalStore.setSelectedExcludedAlterationIndex,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AlterationBadgeList);

interface IAlterationBadge {
  alterationData: AlterationData;
  alterationName: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  isExludedAlteration?: boolean;
}

const AlterationBadge = ({
  alterationData,
  alterationName,
  isSelected,
  onClick,
  onDelete,
  isExludedAlteration = false,
}: IAlterationBadge) => {
  const { ref, overflow } = useOverflowDetector({ handleHeight: false });

  const backgroundColor = useMemo(() => {
    if (alterationData.error) {
      return 'danger';
    }
    if (alterationData.warning) {
      return 'warning';
    }
    if (isExludedAlteration) {
      return 'secondary';
    }
    return 'success';
  }, [alterationData, isExludedAlteration]);

  const statusIcon = useMemo(() => {
    let icon = <FaCircleCheck size={16} />;
    if (alterationData.error) {
      icon = <FaExclamationCircle size={16} />;
    }
    if (alterationData.warning) {
      icon = <FaExclamationTriangle size={16} />;
    }
    return <div className="me-1">{icon}</div>;
  }, [alterationData]);

  const badgeComponent = (
    <div
      key={alterationName}
      className={classNames('badge mx-1 my-1', `badge-outline-${backgroundColor}`, styles.alterationBadge, isSelected && 'active')}
    >
      <div
        className={styles.alterationBadgeName}
        onClick={event => {
          event.stopPropagation();
          onClick();
        }}
      >
        {statusIcon}
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
