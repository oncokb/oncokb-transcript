import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import classnames from 'classnames';
import { LEVELS } from 'app/config/colors';
import styles from './styles.module.scss';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import CancerTypeLevelSummary from '../nestLevelSummary/CancerTypeLevelSummary';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';

export interface IProps {
  title: string;
  nestLevel: NestLevelType;
  firebasePath?: string;
  open?: boolean;
  className?: string;
  mutationUuid?: string;
  cancerTypeUuid?: string;
}

export enum NestLevelType {
  MUTATION,
  MUTATION_EFFECT,
  SOMATIC,
  GERMLINE,
  CANCER_TYPE,
  BIOLOGICAL_EFFECT,
  THERAPY,
}

export const NestLevelMapping: { [key in NestLevelType]: string } = {
  [NestLevelType.MUTATION]: '1',
  [NestLevelType.MUTATION_EFFECT]: '2',
  [NestLevelType.SOMATIC]: '3',
  [NestLevelType.GERMLINE]: '3',
  [NestLevelType.CANCER_TYPE]: '2',
  [NestLevelType.BIOLOGICAL_EFFECT]: '3',
  [NestLevelType.THERAPY]: '3',
};

export enum NestLevel {
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3 = '3',
}

const NestLevelColor: { [key in NestLevel]: string } = {
  [NestLevel.LEVEL_1]: LEVELS['1'],
  [NestLevel.LEVEL_2]: LEVELS['2'],
  [NestLevel.LEVEL_3]: LEVELS['3'],
};

export type RemovableNestLevel = NestLevelType.MUTATION | NestLevelType.CANCER_TYPE | NestLevelType.THERAPY;

const Collapsible: React.FunctionComponent<IProps & StoreProps> = ({
  open,
  children,
  title,
  className,
  nestLevel,
  firebasePath,
  mutationUuid,
  cancerTypeUuid,
  deleteSection,
  data,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleFilterOpening = () => {
    setIsOpen(prev => !prev);
  };

  const showMutationLevelSummary = nestLevel === NestLevelType.MUTATION && !title.includes(',');
  const removableLevel = [NestLevelType.MUTATION, NestLevelType.CANCER_TYPE, NestLevelType.THERAPY].includes(nestLevel);

  return (
    <>
      <div className={classnames('card', className, styles.main)}>
        <div
          className={classnames('card-header d-flex align-items-center p-1 bg-transparent pr-2', styles.header)}
          ref={node => {
            if (node) {
              node.style.setProperty('border-left-color', NestLevelColor[NestLevelMapping[nestLevel]], 'important');
            }
          }}
        >
          <div className="mr-auto d-flex align-items-center">
            <button type="button" className="btn" onClick={handleFilterOpening}>
              {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
            </button>
            <span className="font-weight-bold font-weight-bold">{title}</span>
          </div>
          {showMutationLevelSummary ? <MutationLevelSummary mutationUuid={mutationUuid} /> : undefined}
          {nestLevel === NestLevelType.CANCER_TYPE ? (
            <CancerTypeLevelSummary mutationUuid={mutationUuid} cancerTypeUuid={cancerTypeUuid} />
          ) : undefined}
          {removableLevel ? (
            <>
              <div className={classnames(styles.divider)} />
              <DeleteSectionButton
                sectionName={title}
                deleteHandler={() => deleteSection(nestLevel as RemovableNestLevel, firebasePath)}
                isRemovableWithoutReview={isSectionRemovableWithoutReview(data, nestLevel as RemovableNestLevel, firebasePath)}
              />
            </>
          ) : undefined}
        </div>
        {isOpen && <div className={classnames('card-body', styles.body)}>{children}</div>}
      </div>
    </>
  );
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  data: firebaseGeneStore.data,
  deleteSection: firebaseGeneStore.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(Collapsible));
