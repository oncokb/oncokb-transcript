import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { READABLE_FIELD } from 'app/config/constants/firebase';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import CommentIcon from 'app/shared/icons/CommentIcon';
import EditIcon from 'app/shared/icons/EditIcon';
import ModifyTherapyModal from 'app/shared/modal/ModifyTherapyModal';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import { getTxName, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { get, onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import BadgeGroup from '../BadgeGroup';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import RCTButton from '../button/RCTButton';
import TreatmentLevelSummary from '../nestLevelSummary/TreatmentLevelSummary';
import * as styles from './styles.module.scss';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import { RemovableCollapsible } from './RemovableCollapsible';
import TherapyDropdownGroup from './TherapyDropdownGroup';
import { Unsubscribe } from 'firebase/database';
import { getLocationIdentifier } from 'app/components/geneHistoryTooltip/gene-history-tooltip-utils';

export interface ITherapyCollapsibleProps extends StoreProps {
  therapyPath: string;
  parsedHistoryList?: Map<string, FlattenedHistory[]>;
  mutationName: string;
  mutationUuid: string;
  cancerTypeName: string;
  cancerTypeUuid: string;
  cancerTypePath: string;
  isGermline: boolean;
}

function TherapyCollapsible({
  therapyPath,
  parsedHistoryList,
  mutationName,
  mutationUuid,
  cancerTypeName,
  cancerTypeUuid,
  cancerTypePath,
  isGermline,
  firebaseDb,
  drugList,
  createDrug,
  modifyTherapyModalStore,
  updateTreatmentName,
  deleteSection,
}: ITherapyCollapsibleProps) {
  const [treatmentUuid, setTreatmentUuid] = useState<string | null>(null);
  const [treatmentName, setTreatmentName] = useState<string | null>(null);
  const [treatmentReview, setTreatmentReview] = useState<Review | null>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${therapyPath}/name`), snapshot => {
        setTreatmentName(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${therapyPath}/name_review`), snapshot => {
        setTreatmentReview(snapshot.val());
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(snapshot.val()));
      }),
    );

    onValue(
      ref(firebaseDb, `${therapyPath}/name_uuid`),
      snapshot => {
        setTreatmentUuid(snapshot.val());
      },
      { onlyOnce: true },
    );
  }, [therapyPath, firebaseDb]);

  async function handleDeleteTherapy() {
    if (!firebaseDb || treatmentUuid === null) {
      return;
    }
    const snapshot = await get(ref(firebaseDb, therapyPath));
    deleteSection?.(`${therapyPath}/name`, snapshot.val(), treatmentReview, treatmentUuid);
  }

  if (!treatmentUuid || !treatmentName) {
    return <></>;
  }

  const treatmentNameString = getTxName(drugList ?? [], treatmentName);

  return (
    <>
      <RemovableCollapsible
        idPrefix={`${mutationName}-${cancerTypeName}-${treatmentNameString}`}
        key={treatmentUuid}
        title={`Therapy: ${treatmentNameString}`}
        colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.THERAPY]] }}
        review={treatmentReview}
        info={<TreatmentLevelSummary treatmentPath={therapyPath} />}
        action={
          <>
            <CommentIcon id={treatmentUuid} path={`${therapyPath}/name_comments`} />
            <RCTButton cancerTypePath={cancerTypePath} relevantCancerTypesInfoPath={`${therapyPath}`} />
            <EditIcon
              onClick={() => {
                modifyTherapyModalStore?.openModal(treatmentUuid);
              }}
            />
            <DeleteSectionButton
              sectionName={cancerTypeName}
              deleteHandler={handleDeleteTherapy}
              isRemovableWithoutReview={isRemovableWithoutReview}
            />
          </>
        }
        badge={<BadgeGroup firebasePath={therapyPath} showDeletedBadge={treatmentReview?.removed || false} />}
        isPendingDelete={treatmentReview?.removed || false}
      >
        <TherapyDropdownGroup treatmentPath={therapyPath} />
        <RealtimeTextAreaInput
          firebasePath={`${therapyPath}/description`}
          inputClass={styles.textarea}
          label="Description of Evidence"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}, ${treatmentNameString}, ${READABLE_FIELD.DESCRIPTION}`}
              locationIdentifier={getLocationIdentifier({
                mutationUuid,
                cancerTypesUuid: cancerTypeUuid,
                treatmentUuid,
                fields: [READABLE_FIELD.DESCRIPTION],
              })}
            />
          }
          name="evidenceDescription"
          parseRefs
        />
        <RealtimeTextAreaInput
          firebasePath={`${therapyPath}/short`}
          inputClass={styles.shortTextarea}
          label="Additional Information (Optional)"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${mutationName}, ${cancerTypeName}, ${treatmentNameString}, ${READABLE_FIELD.ADDITIONAL_INFORMATION}`}
              locationIdentifier={getLocationIdentifier({
                mutationUuid,
                cancerTypesUuid: cancerTypeUuid,
                treatmentUuid,
                fields: [READABLE_FIELD.ADDITIONAL_INFORMATION],
              })}
            />
          }
          name="additionalEvidenceDescription"
          parseRefs
        />
      </RemovableCollapsible>
      <ModifyTherapyModal
        treatmentUuid={treatmentUuid}
        treatmentToEditPath={therapyPath}
        drugList={drugList ?? []}
        cancerTypePath={cancerTypePath}
        onConfirm={async (newTreatment, newDrugs) => {
          try {
            await Promise.all(newDrugs.map(drug => createDrug?.(drug)));
            await updateTreatmentName?.(therapyPath, treatmentName, newTreatment, isGermline);
          } catch (error) {
            notifyError(error as Error);
          }

          modifyTherapyModalStore?.closeModal();
        }}
        onCancel={() => modifyTherapyModalStore?.closeModal()}
      />
    </>
  );
}

const mapStoreToProps = ({ firebaseAppStore, drugStore, modifyTherapyModalStore, firebaseGeneService }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  drugList: drugStore.entities,
  createDrug: drugStore.createEntity,
  updateTreatmentName: firebaseGeneService.updateTreatmentName,
  modifyTherapyModalStore,
  deleteSection: firebaseGeneService.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TherapyCollapsible));
