import { CancerType, Review } from 'app/shared/model/firebase/firebase.model';
import { componentInject } from 'app/shared/util/typed-inject';
import { getCancerTypesNameWithExclusion } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { get, onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import EditIcon from 'app/shared/icons/EditIcon';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import _ from 'lodash';
import { READABLE_FIELD } from 'app/config/constants/firebase';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import RealtimeLevelDropdownInput, { LevelOfEvidenceType } from 'app/shared/firebase/input/RealtimeLevelDropdownInput';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import RCTButton from '../button/RCTButton';
import TherapiesList from '../list/TherapiesList';
import CancerTypeLevelSummary from '../nestLevelSummary/CancerTypeLevelSummary';
import Collapsible from './Collapsible';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import * as styles from '../styles.module.scss';
import BadgeGroup from '../BadgeGroup';
import { RemovableCollapsible } from './RemovableCollapsible';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import { Unsubscribe } from 'firebase/database';

interface ICancerTypeCollapsibleProps extends StoreProps {
  cancerTypePath: string;
  allCancerTypesPath: string;
  mutationName: string;
  parsedHistoryList: Map<string, FlattenedHistory[]> | undefined;
  isGermline: boolean;
}

function CancerTypeCollapsible({
  cancerTypePath,
  allCancerTypesPath,
  mutationName,
  parsedHistoryList,
  firebaseDb,
  modifyCancerTypeModalStore,
  updateTumorName,
  deleteSection,
  isGermline,
}: ICancerTypeCollapsibleProps) {
  const [cancerTypes, setCancerTypes] = useState<CancerType[] | null>(null);
  const [cancerTypesUuid, setCancerTypesUuid] = useState<string | null>(null);
  const [cancerTypesReview, setCancerTypesReview] = useState<Review | null>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);
  const [excludedCancerTypes, setExcludedCancerTypes] = useState<CancerType[] | null>(null);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/cancerTypes`), snapshot => {
        setCancerTypes(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/excludedCancerTypes`), snapshot => {
        setExcludedCancerTypes(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/cancerTypes_review`), snapshot => {
        const review = snapshot.val() as Review;
        setCancerTypesReview(review);
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(review));
      }),
    );

    onValue(
      ref(firebaseDb, `${cancerTypePath}/cancerTypes_uuid`),
      snapshot => {
        setCancerTypesUuid(snapshot.val());
      },
      { onlyOnce: true },
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [cancerTypePath, firebaseDb]);

  async function handleDeleteCancerType() {
    if (!firebaseDb || !cancerTypesReview || !cancerTypesUuid) {
      return;
    }
    const snapshot = await get(ref(firebaseDb, cancerTypePath));
    deleteSection?.(`${cancerTypePath}/cancerTypes`, snapshot.val(), cancerTypesReview, cancerTypesUuid);
  }

  if (!cancerTypes || !cancerTypesUuid) {
    return <></>;
  }

  const cancerTypeName = getCancerTypesNameWithExclusion(cancerTypes, excludedCancerTypes || [], true);

  return (
    <>
      <RemovableCollapsible
        collapsibleClassName="mt-2"
        title={`Cancer Type: ${cancerTypeName}`}
        colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.CANCER_TYPE]] }}
        review={cancerTypesReview}
        info={<CancerTypeLevelSummary cancerTypePath={cancerTypePath} />}
        action={
          <>
            <GeneHistoryTooltip
              key={'gene-history-tooltip'}
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}`}
            />
            <CommentIcon id={cancerTypesUuid} path={`${cancerTypePath}/cancerTypes_comments`} />
            <EditIcon
              onClick={() => {
                modifyCancerTypeModalStore?.openModal(cancerTypesUuid);
              }}
            />
            <DeleteSectionButton
              sectionName={cancerTypeName}
              deleteHandler={handleDeleteCancerType}
              isRemovableWithoutReview={isRemovableWithoutReview}
            />
          </>
        }
        badge={<BadgeGroup firebasePath={cancerTypePath} showDeletedBadge={cancerTypesReview?.removed || false} />}
        isPendingDelete={cancerTypesReview?.removed || false}
      >
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/summary`}
          inputClass={styles.summaryTextarea}
          label="Therapeutic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.SUMMARY}`}
            />
          }
          name="txSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/diagnosticSummary`}
          inputClass={styles.summaryTextarea}
          label="Diagnostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.DIAGNOSTIC_SUMMARY}`}
            />
          }
          name="dxSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/prognosticSummary`}
          inputClass={styles.summaryTextarea}
          label="Prognostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.PROGNOSTIC_SUMMARY}`}
            />
          }
          name="pxSummary"
        />
        <Collapsible
          defaultOpen
          title="Therapeutic Implications"
          colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.THERAPEUTIC]] }}
          badge={<BadgeGroup firebasePath={`${cancerTypePath}/TIs`} />}
        >
          <TherapiesList
            parsedHistoryList={parsedHistoryList ?? new Map()}
            mutationName={mutationName}
            cancerTypeName={cancerTypeName}
            cancerTypePath={cancerTypePath}
            tisPath={`${cancerTypePath}/TIs`}
            isGermline={isGermline}
          />
        </Collapsible>
        <Collapsible
          collapsibleClassName={'mt-2'}
          key={`${cancerTypesUuid}_diagnostic`}
          title="Diagnostic Implication"
          colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.DIAGNOSTIC]] }}
          action={
            <>
              <GeneHistoryTooltip
                key={'gene-history-tooltip'}
                historyData={parsedHistoryList}
                location={`${mutationName}, ${cancerTypeName}`}
              />
              <CommentIcon id={cancerTypesUuid} path={`${cancerTypePath}/cancerTypes_comments`} />
              <EditIcon
                onClick={() => {
                  modifyCancerTypeModalStore?.openModal(cancerTypesUuid);
                }}
              />
              <DeleteSectionButton
                sectionName={cancerTypeName}
                deleteHandler={handleDeleteCancerType}
                isRemovableWithoutReview={isRemovableWithoutReview}
              />
            </>
          }
          badge={<BadgeGroup firebasePath={cancerTypePath} showDeletedBadge={cancerTypesReview?.removed || false} />}
          isPendingDelete={cancerTypesReview?.removed || false}
        >
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/summary`}
            inputClass={styles.summaryTextarea}
            label="Therapeutic Summary (Optional)"
            labelIcon={
              <GeneHistoryTooltip
                historyData={parsedHistoryList}
                location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.SUMMARY}`}
              />
            }
            name="txSummary"
          />
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/diagnosticSummary`}
            inputClass={styles.summaryTextarea}
            label="Diagnostic Summary (Optional)"
            labelIcon={
              <GeneHistoryTooltip
                historyData={parsedHistoryList}
                location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.DIAGNOSTIC_SUMMARY}`}
              />
            }
            name="dxSummary"
          />
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/prognosticSummary`}
            inputClass={styles.summaryTextarea}
            label="Prognostic Summary (Optional)"
            labelIcon={
              <GeneHistoryTooltip
                historyData={parsedHistoryList}
                location={`${mutationName}, ${cancerTypeName}, ${READABLE_FIELD.PROGNOSTIC_SUMMARY}`}
              />
            }
            name="pxSummary"
          />
        </Collapsible>
      </RemovableCollapsible>
      <ModifyCancerTypeModal
        cancerTypesUuid={cancerTypesUuid}
        allCancerTypesPath={allCancerTypesPath}
        cancerTypesPathToEdit={cancerTypePath}
        onConfirm={async newTumor => {
          try {
            await updateTumorName?.(cancerTypePath, cancerTypes, excludedCancerTypes, newTumor, isGermline);
          } catch (error) {
            notifyError(error as Error);
          }

          modifyCancerTypeModalStore?.closeModal();
        }}
        onCancel={() => {
          modifyCancerTypeModalStore?.closeModal();
        }}
      />
    </>
  );
}

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneService, modifyCancerTypeModalStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  modifyCancerTypeModalStore,
  updateTumorName: firebaseGeneService.updateTumorName,
  deleteSection: firebaseGeneService.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerTypeCollapsible));
