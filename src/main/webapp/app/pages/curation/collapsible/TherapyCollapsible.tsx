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
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import BadgeGroup from '../BadgeGroup';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import RCTButton from '../button/RCTButton';
import TreatmentLevelSummary from '../nestLevelSummary/TreatmentLevelSummary';
import styles from '../styles.module.scss';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import { RemovableCollapsible } from './RemovableCollapsible';
import TherapyDropdownGroup from './TherapyDropdownGroup';

export interface ITherapyCollapsibleProps extends StoreProps {
  therapyPath: string;
  parsedHistoryList: Map<string, FlattenedHistory[]>;
  mutationName: string;
  cancerTypeName: string;
  cancerTypePath: string;
}

function TherapyCollapsible({
  therapyPath,
  parsedHistoryList,
  mutationName,
  cancerTypeName,
  cancerTypePath,
  firebaseDb,
  drugList,
  createDrug,
  modifyTherapyModalStore,
  updateTreatmentName,
  deleteSection,
}: ITherapyCollapsibleProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [treatmentUuid, setTreatmentUuid] = useState<string>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [treatmentName, setTreatmentName] = useState<string>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [treatmentReview, setTreatmentReview] = useState<Review>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${therapyPath}/name`), snapshot => {
        setTreatmentName(snapshot.val());
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, `${therapyPath}/name_review`), snapshot => {
        setTreatmentReview(snapshot.val());
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(snapshot.val()));
      })
    );

    onValue(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ref(firebaseDb, `${therapyPath}/name_uuid`),
      snapshot => {
        setTreatmentUuid(snapshot.val());
      },
      { onlyOnce: true }
    );
  }, [therapyPath, firebaseDb]);

  if (!treatmentUuid || !treatmentName) {
    return <></>;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const treatmentNameString = getTxName(drugList, treatmentName);

  return (
    <>
      <RemovableCollapsible
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
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                modifyTherapyModalStore.openModal(treatmentUuid);
              }}
            />
            <DeleteSectionButton
              sectionName={cancerTypeName}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              deleteHandler={() => deleteSection(`${therapyPath}/name`, treatmentReview, treatmentUuid)}
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
            />
          }
          name="additionalEvidenceDescription"
          parseRefs
        />
      </RemovableCollapsible>
      <ModifyTherapyModal
        treatmentUuid={treatmentUuid}
        treatmentToEditPath={therapyPath}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        drugList={drugList}
        cancerTypePath={cancerTypePath}
        onConfirm={async (newTreatment, newDrugs) => {
          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await Promise.all(newDrugs.map(drug => createDrug(drug)));
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await updateTreatmentName(therapyPath, treatmentName, newTreatment);
          } catch (error) {
            notifyError(error);
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          modifyTherapyModalStore.closeModal();
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onCancel={modifyTherapyModalStore.closeModal}
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
