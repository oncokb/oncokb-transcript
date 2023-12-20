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
import { isSectionEmpty, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { Gene } from 'app/shared/model/firebase/firebase.model';
import { buildFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';

export interface IProps {
  title: string;
  nestLevel: NestLevelType;
  geneFieldKey: ExtractPathExpressions<Gene>;
  open?: boolean;
  className?: string;
  mutationUuid?: string;
  cancerTypeUuid?: string;
  actions?: JSX.Element[];
}

export enum NestLevelType {
  MUTATION,
  MUTATION_EFFECT,
  SOMATIC,
  GERMLINE,
  CANCER_TYPE,
  THERAPY,
}

export const NestLevelMapping: { [key in NestLevelType]: string } = {
  [NestLevelType.MUTATION]: '1',
  [NestLevelType.MUTATION_EFFECT]: '2',
  [NestLevelType.SOMATIC]: '3',
  [NestLevelType.GERMLINE]: '3',
  [NestLevelType.CANCER_TYPE]: '2',
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
  geneFieldKey,
  mutationUuid,
  cancerTypeUuid,
  deleteSection,
  data,
  actions,
  hugoSymbol,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleFilterOpening = () => {
    setIsOpen(prev => !prev);
  };

  const showMutationLevelSummary = nestLevel === NestLevelType.MUTATION && !title.includes(',');
  const removableLevel = [NestLevelType.MUTATION, NestLevelType.CANCER_TYPE, NestLevelType.THERAPY].includes(nestLevel);
  const firebasePath = buildFirebaseGenePath(hugoSymbol, geneFieldKey);

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
            {isSectionEmpty(data, firebasePath) ? (
              <span className={`badge badge-pill badge-info ml-2 mr-2`} style={{ fontSize: '60%' }}>
                No entry
              </span>
            ) : undefined}
          </div>
          {showMutationLevelSummary ? <MutationLevelSummary mutationUuid={mutationUuid} /> : undefined}
          {nestLevel === NestLevelType.CANCER_TYPE ? (
            <CancerTypeLevelSummary mutationUuid={mutationUuid} cancerTypeUuid={cancerTypeUuid} />
          ) : undefined}
          {removableLevel ? (
            <>
              <div className={classnames(styles.divider)} />
              {actions &&
                actions.map((action, index) => (
                  <span key={index} style={{ marginRight: '.75rem' }}>
                    {action}
                  </span>
                ))}
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
  hugoSymbol: firebaseGeneStore.hugoSymbol,
  deleteSection: firebaseGeneStore.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(Collapsible));
