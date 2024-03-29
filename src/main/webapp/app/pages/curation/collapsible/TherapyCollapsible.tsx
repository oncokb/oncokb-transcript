import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { CANCER_TYPE_THERAPY_INDENTIFIER } from 'app/config/constants/constants';
import treatment from 'app/entities/treatment';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import EditIcon from 'app/shared/icons/EditIcon';
import ModifyTherapyModal from 'app/shared/modal/ModifyTherapyModal';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { getTxName, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import TherapyDropdownGroup from './TherapyDropdownGroup';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { ParsedHistoryRecord } from '../CurationPage';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import RCTButton from '../button/RCTButton';
import TreatmentLevelSummary from '../nestLevelSummary/TreatmentLevelSummary';
import Collapsible from './Collapsible';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import styles from '../styles.module.scss';
import BadgeGroup from '../BadgeGroup';
import { RemovableCollapsible } from './RemovableCollapsible';

export interface ITherapyCollapsibleProps extends StoreProps {
  therapyPath: string;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
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
  const [treatmentUuid, setTreatmentUuid] = useState<string>(null);
  const [treatmentName, setTreatmentName] = useState<string>(null);
  const [treatmentReview, setTreatmentReview] = useState<Review>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${therapyPath}/name`), snapshot => {
        setTreatmentName(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${therapyPath}/name_review`), snapshot => {
        setTreatmentReview(snapshot.val());
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(snapshot.val()));
      })
    );

    onValue(
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
                modifyTherapyModalStore.openModal(treatmentUuid);
              }}
            />
            <DeleteSectionButton
              sectionName={cancerTypeName}
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
              location={`${CANCER_TYPE_THERAPY_INDENTIFIER}${mutationName}, ${cancerTypeName}, ${treatmentName}`}
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
              location={`${CANCER_TYPE_THERAPY_INDENTIFIER}${mutationName}, ${cancerTypeName}, ${treatment.name}`}
            />
          }
          name="additionalEvidenceDescription"
          parseRefs
        />
      </RemovableCollapsible>
      <ModifyTherapyModal
        treatmentUuid={treatmentUuid}
        treatmentToEditPath={therapyPath}
        drugList={drugList}
        cancerTypePath={cancerTypePath}
        onConfirm={async (newTreatment, newDrugs) => {
          try {
            await Promise.all(newDrugs.map(drug => createDrug(drug)));
            await updateTreatmentName(therapyPath, treatmentName, newTreatment);
          } catch (error) {
            notifyError(error);
          }

          modifyTherapyModalStore.closeModal();
        }}
        onCancel={modifyTherapyModalStore.closeModal}
      />
    </>
  );
}

const mapStoreToProps = ({ firebaseStore, drugStore, modifyTherapyModalStore, firebaseGeneStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  drugList: drugStore.entities,
  createDrug: drugStore.createEntity,
  updateTreatmentName: firebaseGeneStore.updateTreatmentName,
  modifyTherapyModalStore,
  deleteSection: firebaseGeneStore.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TherapyCollapsible));
