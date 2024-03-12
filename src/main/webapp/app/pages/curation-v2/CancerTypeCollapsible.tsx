import { CancerType, Review } from 'app/shared/model/firebase/firebase.model';
import { componentInject } from 'app/shared/util/typed-inject';
import { getCancerTypesNameWithExclusion } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import Collapsible from '../curation/collapsible/Collapsible';
import { NestLevelColor, NestLevelMapping, NestLevelType } from '../curation/collapsible/NestLevel';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { ParsedHistoryRecord } from './CurationPage';
import { isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import CommentIcon from './CommentIcon';
import EditIcon from 'app/shared/icons/EditIcon';
import { RealtimeTextAreaInput } from './input/RealtimeInputs';
import RCTButton from '../curation/button/RCTButton';
import TherapiesList from './TherapiesList';
import { DeleteSectionButton } from '../curation/button/DeleteSectionButton';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import _ from 'lodash';

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
  relevantCancerTypesModalStore,
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
  }, []);

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
        // info={<CancerTypeLevelSummary mutationUuid={mutation.name_uuid} cancerTypeUuid={tumor.cancerTypes_uuid} />}
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
              deleteHandler={() =>
                deleteSection(NestLevelType.MUTATION, `${cancerTypePath}/cancerTypes`, cancerTypesReview, cancerTypesUuid)
              }
              isRemovableWithoutReview={isRemovableWithoutReview}
            />
          </>
        }
        // isSectionEmpty={isSectionEmpty(data, cancerTypeFirebasePath)}
        isPendingDelete={cancerTypesReview?.removed || false}
      >
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/summary`}
          // inputClass={styles.summaryTextarea}
          label="Therapeutic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Tumor Type Summary`} />
          }
          name="txSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/diagnosticSummary`}
          // inputClass={styles.summaryTextarea}
          label="Diagnostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Diagnostic Summary`} />
          }
          name="dxSummary"
        />
        <RealtimeTextAreaInput
          firebasePath={`${cancerTypePath}/prognosticSummary`}
          // inputClass={styles.summaryTextarea}
          label="Prognostic Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip historyData={parsedHistoryList} location={`${mutationName}, ${cancerTypeName}, Prognostic Summary`} />
          }
          name="pxSummary"
        />
        <Collapsible open title="Therapeutic Implications" borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.THERAPEUTIC]]}>
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
          // isSectionEmpty={isSectionEmpty(
          //     data,
          //     buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic`)
          // )}
        >
          {/* <RealtimeDropdownInput
            fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic/level`}
            label="Level of evidence"
            name="level"
            options={getLevelDropdownOptions(DIAGNOSTIC_LEVELS_ORDERING)}
        /> */}
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/diagnostic/description`}
            // inputClass={styles.textarea}
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
          // isSectionEmpty={isSectionEmpty(
          //     data,
          //     buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic`)
          // )}
        >
          {/* <RealtimeDropdownInput
            fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic/level`}
            label="Level of evidence"
            name="level"
            options={getLevelDropdownOptions(PROGNOSTIC_LEVELS_ORDERING)}
        /> */}
          <RealtimeTextAreaInput
            firebasePath={`${cancerTypePath}/prognostic/description`}
            // inputClass={styles.textarea}
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
  relevantCancerTypesModalStore,
  updateTumor: firebaseGeneStore.updateTumor,
  deleteSection: firebaseGeneStore.deleteSection,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerTypeCollapsible));
