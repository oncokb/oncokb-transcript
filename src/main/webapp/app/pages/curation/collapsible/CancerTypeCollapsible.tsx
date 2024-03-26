import { CancerType, Review } from 'app/shared/model/firebase/firebase.model';
import { componentInject } from 'app/shared/util/typed-inject';
import { getCancerTypesNameWithExclusion } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import EditIcon from 'app/shared/icons/EditIcon';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import _ from 'lodash';
import { getLevelDropdownOptions } from 'app/shared/util/firebase/firebase-level-utils';
import { DIAGNOSTIC_LEVELS_ORDERING, PROGNOSTIC_LEVELS_ORDERING } from 'app/config/constants/firebase';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import RealtimeLevelDropdownInput, { LevelOfEvidenceType } from 'app/shared/firebase/input/RealtimeLevelDropdownInput';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { ParsedHistoryRecord } from '../CurationPage';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import RCTButton from '../button/RCTButton';
import TherapiesList from '../list/TherapiesList';
import CancerTypeLevelSummary from '../nestLevelSummary/CancerTypeLevelSummary';
import Collapsible from './Collapsible';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import styles from '../styles.module.scss';
import BadgeGroup from '../BadgeGroup';

interface ICancerTypeCollapsibleProps extends StoreProps {
  cancerTypePath: string;
  mutationName: string;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
}

function CancerTypeCollapsible({
  cancerTypePath,
  mutationName,
  parsedHistoryList,
  firebaseDb,
  modifyCancerTypeModalStore,
  updateTumor,
  deleteSection,
}: ICancerTypeCollapsibleProps) {
  const [cancerTypes, setCancerTypes] = useState<CancerType[]>(null);
  const [cancerTypesUuid, setCancerTypesUuid] = useState<string>(null);
  const [cancerTypesReview, setCancerTypesReview] = useState<Review>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);
  const [excludedCancerTypes, setExcludedCancerTypes] = useState<CancerType[]>(null);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/cancerTypes`), snapshot => {
        setCancerTypes(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/excludedCancerTypes`), snapshot => {
        setExcludedCancerTypes(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${cancerTypePath}/cancerTypes_review`), snapshot => {
        const review = snapshot.val() as Review;
        setCancerTypesReview(review);
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(review));
      })
    );

    onValue(
      ref(firebaseDb, `${cancerTypePath}/cancerTypes_uuid`),
      snapshot => {
        setCancerTypesUuid(snapshot.val());
      },
      { onlyOnce: true }
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [cancerTypePath, firebaseDb]);

  if (!cancerTypes || !cancerTypesUuid) {
    return <></>;
  }

  const cancerTypeName = getCancerTypesNameWithExclusion(cancerTypes, excludedCancerTypes || [], true);

  return (
    <>
      <Collapsible
        className="mt-2"
        title={`Cancer Type: ${cancerTypeName}`}
        borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.CANCER_TYPE]]}
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
                modifyCancerTypeModalStore.openModal(cancerTypesUuid);
              }}
            />
            <DeleteSectionButton
              sectionName={cancerTypeName}
              deleteHandler={() => deleteSection(`${cancerTypePath}/cancerTypes`, cancerTypesReview, cancerTypesUuid)}
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
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Tumor Type Summary`} />
          }
          name="txSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/diagnosticSummary`}
          inputClass={styles.summaryTextarea}
          label="Diagnostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Diagnostic Summary`} />
          }
          name="dxSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/prognosticSummary`}
          inputClass={styles.summaryTextarea}
          label="Prognostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Prognostic Summary`} />
          }
          name="pxSummary"
        />
        <Collapsible
          open
          title="Therapeutic Implications"
          borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.THERAPEUTIC]]}
          badge={<BadgeGroup firebasePath={`${cancerTypePath}/TIs`} />}
        >
          <TherapiesList
            parsedHistoryList={parsedHistoryList}
            mutationName={mutationName}
            cancerTypeName={cancerTypeName}
            cancerTypePath={cancerTypePath}
            tisPath={`${cancerTypePath}/TIs`}
          />
        </Collapsible>
        <Collapsible
          className={'mt-2'}
          key={`${cancerTypesUuid}_diagnostic`}
          title="Diagnostic Implication"
          borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.DIAGNOSTIC]]}
          action={
            <>
              <CommentIcon id={`${cancerTypesUuid}_diagnostic_comments`} path={`${cancerTypePath}/diagnostic_comments`} />
              <RCTButton cancerTypePath={cancerTypePath} relevantCancerTypesInfoPath={`${cancerTypePath}/diagnostic`} />
            </>
          }
          badge={<BadgeGroup firebasePath={`${cancerTypePath}/diagnostic`} />}
        >
          <RealtimeLevelDropdownInput
            firebaseLevelPath={`${cancerTypePath}/diagnostic/level`}
            levelOfEvidenceType={LevelOfEvidenceType.DIAGNOSTIC}
            label="Level of evidence"
            name="diagnosticLevel"
            options={getLevelDropdownOptions(DIAGNOSTIC_LEVELS_ORDERING)}
          />
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/diagnostic/description`}
            inputClass={styles.textarea}
            label="Description of Evidence"
            name="evidenceDescription"
            parseRefs
          />
        </Collapsible>
        <Collapsible
          className={'mt-2'}
          key={`${cancerTypesUuid}_prognostic`}
          title="Prognostic Implication"
          borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.PROGNOSTIC]]}
          action={
            <>
              <CommentIcon id={`${cancerTypesUuid}_prognostic_comments`} path={`${cancerTypePath}/prognostic_comments`} />
              <RCTButton cancerTypePath={cancerTypePath} relevantCancerTypesInfoPath={`${cancerTypePath}/prognostic`} />
            </>
          }
          badge={<BadgeGroup firebasePath={`${cancerTypePath}/prognostic`} />}
        >
          <RealtimeLevelDropdownInput
            firebaseLevelPath={`${cancerTypePath}/prognostic/level`}
            levelOfEvidenceType={LevelOfEvidenceType.PROGNOSTIC}
            label="Level of evidence"
            name="prognosticLevel"
            options={getLevelDropdownOptions(PROGNOSTIC_LEVELS_ORDERING)}
          />
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/prognostic/description`}
            inputClass={styles.textarea}
            label="Description of Evidence"
            name="evidenceDescription"
            parseRefs
          />
        </Collapsible>
      </Collapsible>
      <ModifyCancerTypeModal
        cancerTypesUuid={cancerTypesUuid}
        cancerTypesPathToEdit={cancerTypePath}
        onConfirm={async newTumor => {
          try {
            await updateTumor(cancerTypePath, newTumor);
          } catch (error) {
            notifyError(error);
          }

          modifyCancerTypeModalStore.closeModal();
        }}
        onCancel={() => {
          modifyCancerTypeModalStore.closeModal();
        }}
      />
    </>
  );
}

const mapStoreToProps = ({ firebaseStore, firebaseGeneStore, modifyCancerTypeModalStore, relevantCancerTypesModalStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  modifyCancerTypeModalStore,
  updateTumor: firebaseGeneStore.updateTumor,
  deleteSection: firebaseGeneStore.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerTypeCollapsible));
