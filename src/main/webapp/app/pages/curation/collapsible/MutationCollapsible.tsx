import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import CancerRiskTabs from 'app/components/tabs/CancerRiskTabs';
import { RADIO_OPTION_NONE } from 'app/config/constants/constants';
import {
  INHERITANCE_MECHANISM_OPTIONS,
  MUTATION_EFFECT_OPTIONS,
  ONCOGENICITY_OPTIONS,
  PATHOGENICITY_OPTIONS,
  PENETRANCE_OPTIONS,
} from 'app/config/constants/firebase';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import CommentIcon from 'app/shared/icons/CommentIcon';
import EditIcon from 'app/shared/icons/EditIcon';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { Alteration, Review } from 'app/shared/model/firebase/firebase.model';
import { getMutationName, isMutationEffectCuratable, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import BadgeGroup from '../BadgeGroup';
import { ParsedHistoryRecord } from '../CurationPage';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import FirebaseList from '../list/FirebaseList';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import styles from '../styles.module.scss';
import CancerTypeCollapsible from './CancerTypeCollapsible';
import Collapsible from './Collapsible';
import { DISABLED_NEST_LEVEL_COLOR, NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import MutationPenetranceTabs from 'app/components/tabs/PenetranceTabs';

export interface IMutationCollapsibleProps extends StoreProps {
  mutationPath: string;
  hugoSymbol: string;
  isGermline: boolean;
  open?: boolean;
  disableOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
}

const MutationCollapsible = ({
  mutationPath,
  hugoSymbol,
  isGermline,
  open,
  disableOpen = false,
  onToggle,
  firebaseDb,
  parsedHistoryList,
  deleteSection,
  updateMutationName,
  addTumor,
  modifyCancerTypeModalStore,
}: IMutationCollapsibleProps) => {
  const [mutationUuid, setMutationUuid] = useState<string>(null);
  const [mutationName, setMutationName] = useState<string>(null);
  const [mutationNameReview, setMutationNameReview] = useState<Review>(null);
  const [mutationAlterations, setMutationAlterations] = useState<Alteration[]>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);

  const [isEditingMutation, setIsEditingMutation] = useState(false);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/name`), snapshot => {
        setMutationName(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/alterations`), snapshot => {
        setMutationAlterations(snapshot.val());
      })
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/name_review`), snapshot => {
        const review = snapshot.val() as Review;
        setMutationNameReview(review);
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(review));
      })
    );

    onValue(
      ref(firebaseDb, `${mutationPath}/name_uuid`),
      snapshot => {
        setMutationUuid(snapshot.val());
      },
      { onlyOnce: true }
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [mutationPath, firebaseDb]);

  if (!mutationUuid || !mutationName) {
    return <></>;
  }

  const title = getMutationName(mutationName, mutationAlterations);
  const isStringMutation = title.includes(',');
  const isMECuratable = isMutationEffectCuratable(title);

  return (
    <>
      <Collapsible
        open={open}
        disableOpen={disableOpen}
        className="mb-1"
        title={title}
        borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.MUTATION]]}
        info={<MutationLevelSummary mutationPath={mutationPath} hideOncogenicity={isStringMutation} />}
        onToggle={onToggle ? isOpen => onToggle(isOpen) : null}
        action={
          <>
            <GeneHistoryTooltip
              key={'gene-history-tooltip'}
              historyData={parsedHistoryList}
              location={getMutationName(mutationName, mutationAlterations)}
            />
            <CommentIcon id={mutationUuid} path={`${mutationPath}/name_comments`} />
            <EditIcon
              onClick={() => {
                setIsEditingMutation(true);
              }}
            />
            <DeleteSectionButton
              sectionName={title}
              deleteHandler={() => deleteSection(`${mutationPath}/name`, mutationNameReview, mutationUuid)}
              isRemovableWithoutReview={isRemovableWithoutReview}
            />
          </>
        }
        badge={<BadgeGroup firebasePath={mutationPath} showDeletedBadge={mutationNameReview?.removed || false} />}
        isPendingDelete={mutationNameReview?.removed || false}
      >
        <Collapsible
          open={isMECuratable}
          title="Mutation Effect"
          borderLeftColor={isMECuratable ? NestLevelColor[NestLevelMapping[NestLevelType.MUTATION_EFFECT]] : DISABLED_NEST_LEVEL_COLOR}
          disableCollapsible={!isMECuratable}
          badge={
            <BadgeGroup
              firebasePath={`${mutationPath}/mutation_effect`}
              showNotCuratableBadge={{ show: !isMECuratable, mutationName: title }}
            />
          }
          action={isMECuratable && <CommentIcon id={`${mutationUuid}_mutation_effect`} path={`${mutationPath}/mutation_effect_comments`} />}
        >
          {isGermline ? (
            <RealtimeCheckedInputGroup
              groupHeader={
                <>
                  <span style={{ marginRight: '8px' }}>Pathogenicity</span>
                  {
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Effect`}
                      contentFieldWhenObject="pathogenic"
                    />
                  }
                </>
              }
              isRadio
              options={[...PATHOGENICITY_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                label,
                firebasePath: `${mutationPath}/mutation_effect/pathogenic`,
              }))}
            />
          ) : (
            <>
              <RealtimeCheckedInputGroup
                groupHeader={
                  <>
                    <span style={{ marginRight: '8px' }}>Oncogenic</span>
                    {
                      <GeneHistoryTooltip
                        historyData={parsedHistoryList}
                        location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Effect`}
                        contentFieldWhenObject="oncogenic"
                      />
                    }
                  </>
                }
                isRadio
                options={[...ONCOGENICITY_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                  label,
                  firebasePath: `${mutationPath}/mutation_effect/oncogenic`,
                }))}
              />
              <RealtimeCheckedInputGroup
                groupHeader={
                  <>
                    <span style={{ marginRight: '8px' }}>Mutation Effect</span>
                    {
                      <GeneHistoryTooltip
                        historyData={parsedHistoryList}
                        location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Effect`}
                        contentFieldWhenObject="effect"
                      />
                    }
                  </>
                }
                isRadio
                options={[...MUTATION_EFFECT_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                  label,
                  firebasePath: `${mutationPath}/mutation_effect/effect`,
                }))}
              />
            </>
          )}
          <RealtimeTextAreaInput
            firebasePath={`${mutationPath}/mutation_effect/description`}
            inputClass={styles.textarea}
            label="Description of Evidence"
            labelIcon={
              <GeneHistoryTooltip
                historyData={parsedHistoryList}
                location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Effect`}
              />
            }
            name="description"
            parseRefs
          />
        </Collapsible>
        {isGermline && (
          <>
            <Collapsible
              className="mt-2"
              title={'Mutation Specific Penetrance'}
              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.PENETRANCE]]}
              badge={<BadgeGroup firebasePath={`${mutationPath}/mutation_penetrance`} />}
            >
              <MutationPenetranceTabs
                mutationPenetrancePath={`${mutationPath}/mutation_penetrance`}
                mutationName={mutationName}
                mutationAlterations={mutationAlterations}
                parsedHistoryList={parsedHistoryList}
                textAreaClass={styles.textarea}
              />
            </Collapsible>
            <Collapsible
              className="mt-2"
              title={'Mutation Specific Mechanism of Inheritance'}
              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.INHERITANCE_MECHANISM]]}
              badge={<BadgeGroup firebasePath={`${mutationPath}/inheritance_mechanism`} />}
            >
              <>
                <RealtimeCheckedInputGroup
                  groupHeader={
                    <>
                      <span style={{ marginRight: '8px' }}>Mechanism of Inheritance</span>
                      {
                        <GeneHistoryTooltip
                          historyData={parsedHistoryList}
                          location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Specific Inheritance Mechanism`}
                          contentFieldWhenObject="inheritanceMechanism"
                        />
                      }
                    </>
                  }
                  isRadio
                  options={[...INHERITANCE_MECHANISM_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${mutationPath}/inheritance_mechanism/inheritanceMechanism`,
                  }))}
                />
                <RealtimeTextAreaInput
                  firebasePath={`${mutationPath}/inheritance_mechanism/description`}
                  inputClass={styles.textarea}
                  label="Description of Inheritance Mechanism"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutationName, mutationAlterations)}, Mutation Specific Inheritance Mechanism`}
                    />
                  }
                  name="description"
                  parseRefs
                />
              </>
            </Collapsible>
            <Collapsible
              className="mt-2"
              title={'Mutation Specific Cancer Risk'}
              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.CANCER_RISK]]}
              badge={<BadgeGroup firebasePath={`${mutationPath}/cancer_risk`} />}
            >
              <CancerRiskTabs cancerRiskPath={`${mutationPath}/cancer_risk`} textAreaClass={styles.textarea} />
            </Collapsible>
          </>
        )}
        <FirebaseList
          path={`${mutationPath}/tumors`}
          pushDirection="back"
          itemBuilder={index => {
            return (
              <CancerTypeCollapsible
                cancerTypePath={`${mutationPath}/tumors/${index}`}
                mutationName={mutationName}
                parsedHistoryList={parsedHistoryList}
              />
            );
          }}
        />
        <Button
          className={'mt-2 mb-1'}
          outline
          color="primary"
          onClick={() => modifyCancerTypeModalStore.openModal(`new_cancer_type_for_${mutationUuid}`)}
        >
          Add Cancer Type
        </Button>
      </Collapsible>
      <ModifyCancerTypeModal
        cancerTypesUuid={`new_cancer_type_for_${mutationUuid}`}
        onConfirm={async newTumor => {
          try {
            await addTumor(`${mutationPath}/tumors`, newTumor);
          } catch (error) {
            notifyError(error);
          }

          modifyCancerTypeModalStore.closeModal();
        }}
        onCancel={() => {
          modifyCancerTypeModalStore.closeModal();
        }}
      />
      {isEditingMutation ? (
        <AddMutationModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          mutationToEditPath={isEditingMutation ? mutationPath : null}
          onConfirm={async newMutation => {
            try {
              await updateMutationName(mutationPath, mutationName, newMutation);
            } catch (error) {
              notifyError(error);
            }
            setIsEditingMutation(false);
          }}
          onCancel={() => {
            setIsEditingMutation(false);
          }}
        />
      ) : undefined}
    </>
  );
};

const mapStoreToProps = ({
  firebaseStore,
  firebaseGeneStore,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  authStore,
  drugStore,
}: IRootStore) => ({
  data: firebaseGeneStore.data,
  deleteSection: firebaseGeneStore.deleteSection,
  addTumor: firebaseGeneStore.addTumor,
  updateMutationName: firebaseGeneStore.updateMutationName,
  firebasePushToArray: firebaseGeneStore.pushToArray,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  handleFirebaseDeleteFromArray: firebaseGeneStore.deleteFromArray,
  handleFirebaseUpdateUntemplated: firebaseGeneStore.updateUntemplated,
  account: authStore.account,
  createDrug: drugStore.createEntity,
  getDrugs: drugStore.getEntities,
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsible));
