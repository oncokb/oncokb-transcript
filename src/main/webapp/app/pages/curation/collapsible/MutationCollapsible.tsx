import React, { useMemo, useState } from 'react';
import Collapsible from './Collapsible';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import {
  Comment,
  Alteration,
  DX_LEVELS,
  Mutation,
  PX_LEVELS,
  TX_LEVELS,
  Treatment,
  Tumor,
  VusObjList,
} from 'app/shared/model/firebase/firebase.model';
import { buildFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import {
  getMutationName,
  getTxName,
  getValueByNestedKey,
  isDnaVariant,
  isMutationEffectCuratable,
  isPendingDelete,
  isSectionEmpty,
  isSectionRemovableWithoutReview,
  sortByTxLevel,
} from 'app/shared/util/firebase/firebase-utils';
import { DISABLED_NEST_LEVEL_COLOR, NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import { ParsedHistoryRecord } from '../CurationPage';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/FirebaseRealtimeInput';
import {
  DIAGNOSTIC_LEVELS_ORDERING,
  FDA_LEVEL_KEYS,
  MUTATION_EFFECT_OPTIONS,
  ONCOGENICITY_OPTIONS,
  PROGNOSTIC_LEVELS_ORDERING,
  tooManyRCTsText,
} from 'app/config/constants/firebase';
import styles from './styles.module.scss';
import {
  CANCER_TYPE_THERAPY_INDENTIFIER,
  GERMLINE_INHERITANCE_MECHANISM,
  GET_ALL_DRUGS_PAGE_SIZE,
  PATHOGENICITY,
  PENETRANCE,
  RADIO_OPTION_NONE,
} from 'app/config/constants/constants';
import { generateUuid, getCancerTypesNameWithExclusion, getUserFullName, tumorContainsSpecialCancerType } from 'app/shared/util/utils';
import CancerTypeLevelSummary from '../nestLevelSummary/CancerTypeLevelSummary';
import RealtimeDropdownInput from 'app/shared/firebase/input/RealtimeDropdownInput';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import _ from 'lodash';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import TreatmentLevelSummary from '../nestLevelSummary/TreatmentLevelSummary';
import { IDrug } from 'app/shared/model/drug.model';
import ModifyTherapyModal from 'app/shared/modal/ModifyTherapyModal';
import EditIcon from 'app/shared/icons/EditIcon';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { Button } from 'reactstrap';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import NoEntryBadge from 'app/shared/badge/NoEntryBadge';
import RCTButton from '../button/RCTButton';
import NotCuratableBadge from 'app/shared/badge/NotCuratableBadge';
import classNames from 'classnames';
import { getLevelDropdownOptions } from 'app/shared/util/firebase/firebase-level-utils';
import { TherapyDropdownGroup } from './TherapyDropdownGroup';

export interface IMutationCollapsibleProps extends StoreProps {
  mutationList: Mutation[];
  vusList: VusObjList;
  mutation: Mutation;
  firebaseIndex: number;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
  drugList: readonly IDrug[];
  open?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const MutationCollapsible = ({
  data,
  hugoSymbol,
  deleteSection,
  updateTumor,
  updateTreatment,
  updateMutation,
  mutationList,
  vusList,
  mutation,
  firebaseIndex,
  parsedHistoryList,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  drugList,
  handleFirebaseUpdateUntemplated,
  handleFirebaseDeleteFromArray,
  account,
  firebasePushToArray,
  open = false,
  onToggle,
  createDrug,
  getDrugs,
}: IMutationCollapsibleProps) => {
  const title = getMutationName(mutation);
  const mutationFirebasePath = buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}`);

  const [isEditingMutation, setIsEditingMutation] = useState(false);

  const isStringMutation = useMemo(() => {
    return title.includes(',');
  }, [title]);

  const isMECuratable = useMemo(() => {
    return isMutationEffectCuratable(title);
  }, [title]);

  async function handleCreateComment(path: string, content: string, currentCommentsLength: number) {
    // replace with runTransaction?
    const newComment = new Comment();
    newComment.content = content;
    newComment.email = account.email;
    newComment.resolved = 'false';
    newComment.userName = getUserFullName(account);

    try {
      await handleFirebaseUpdateUntemplated(path, [...Array(currentCommentsLength).fill({}), newComment]);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDeleteComments(path: string, indices: number[]) {
    try {
      await handleFirebaseDeleteFromArray(path, indices);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleResolveComment(path: string) {
    try {
      await handleFirebaseUpdateUntemplated(path, { resolved: true });
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleUnresolveComment(path: string) {
    try {
      await handleFirebaseUpdateUntemplated(path, { resolved: false });
    } catch (error) {
      notifyError(error);
    }
  }

  const dnaVariants = _.chain(data.mutations)
    .reduce((acc, curr) => {
      const alts = curr.alterations || [];
      acc.push(...alts.filter(alt => isDnaVariant(alt)));
      return acc;
    }, [] as Alteration[])
    .uniq()
    .value();
  const associatedDnaVariants = dnaVariants.filter(alt => alt.proteinChange === mutation.name).map(alt => alt.alteration);

  const getCancerRiskTabTitle = (crTitle: string, crKey: string) => {
    const val = getValueByNestedKey(data, crKey);
    return (
      <span>
        {crTitle}
        {!val && <NoEntryBadge />}
      </span>
    );
  };

  const isMutationPendingDelete = isPendingDelete(data, NestLevelType.MUTATION, mutationFirebasePath);

  return (
    <>
      <Collapsible
        open={open}
        className={'mb-1'}
        title={title}
        borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.MUTATION]]}
        info={<MutationLevelSummary mutationUuid={mutation.name_uuid} hideOncogenicity={isStringMutation} />}
        onToggle={onToggle ? isOpen => onToggle(isOpen) : null}
        action={
          <>
            <GeneHistoryTooltip key={'gene-history-tooltip'} historyData={parsedHistoryList} location={getMutationName(mutation)} />
            <CommentIcon
              id={mutation.name_uuid}
              comments={mutation.name_comments || []}
              onCreateComment={content =>
                handleCreateComment(`${mutationFirebasePath}/name_comments`, content, mutation.name_comments?.length || 0)
              }
              onDeleteComments={indices => handleDeleteComments(`${mutationFirebasePath}/name_comments`, indices)}
              onResolveComment={index => handleResolveComment(`${mutationFirebasePath}/name_comments/${index}`)}
              onUnresolveComment={index => handleUnresolveComment(`${mutationFirebasePath}/name_comments/${index}`)}
            />
            <EditIcon
              onClick={() => {
                setIsEditingMutation(true);
              }}
            />
            <DeleteSectionButton
              sectionName={title}
              deleteHandler={() => deleteSection(NestLevelType.MUTATION, mutationFirebasePath)}
              isRemovableWithoutReview={isSectionRemovableWithoutReview(data, NestLevelType.MUTATION, mutationFirebasePath)}
            />
          </>
        }
        isSectionEmpty={isSectionEmpty(data, mutationFirebasePath)}
        isPendingDelete={isMutationPendingDelete}
      >
        <Collapsible
          open={isMECuratable}
          title="Mutation Effect"
          borderLeftColor={isMECuratable ? NestLevelColor[NestLevelMapping[NestLevelType.MUTATION_EFFECT]] : DISABLED_NEST_LEVEL_COLOR}
          disableCollapsible={!isMECuratable}
          badgeOverride={!isMECuratable && <NotCuratableBadge mutationName={title} />}
          action={
            isMECuratable && (
              <CommentIcon
                id={mutation.mutation_effect_uuid}
                comments={mutation.mutation_effect_comments || []}
                onCreateComment={content =>
                  handleCreateComment(
                    `${mutationFirebasePath}/mutation_effect_comments`,
                    content,
                    mutation.mutation_effect_comments?.length || 0
                  )
                }
                onDeleteComments={indices => handleDeleteComments(`${mutationFirebasePath}/mutation_effect_comments`, indices)}
                onResolveComment={index => handleResolveComment(`${mutationFirebasePath}/mutation_effect_comments/${index}`)}
                onUnresolveComment={index => handleUnresolveComment(`${mutationFirebasePath}/mutation_effect_comments/${index}`)}
              />
            )
          }
          isSectionEmpty={isSectionEmpty(data, buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/mutation_effect`))}
        >
          {associatedDnaVariants.length > 0 && (
            <div className={'mb-3'}>
              <b>Associated c. variant in the gene: </b>
              <span>{associatedDnaVariants.join(',')}</span>
            </div>
          )}
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span style={{ marginRight: '8px' }}>Oncogenic</span>
                {
                  <GeneHistoryTooltip
                    historyData={parsedHistoryList}
                    location={`${getMutationName(mutation)}, Mutation Effect`}
                    contentFieldWhenObject="oncogenic"
                  />
                }
              </>
            }
            isRadio
            options={[...ONCOGENICITY_OPTIONS, RADIO_OPTION_NONE].map(label => ({
              label,
              fieldKey: `mutations/${firebaseIndex}/mutation_effect/oncogenic`,
            }))}
          />
          <RealtimeCheckedInputGroup
            groupHeader={
              <>
                <span style={{ marginRight: '8px' }}>Mutation Effect</span>
                {
                  <GeneHistoryTooltip
                    historyData={parsedHistoryList}
                    location={`${getMutationName(mutation)}, Mutation Effect`}
                    contentFieldWhenObject="effect"
                  />
                }
              </>
            }
            isRadio
            options={[...MUTATION_EFFECT_OPTIONS, RADIO_OPTION_NONE].map(label => ({
              label,
              fieldKey: `mutations/${firebaseIndex}/mutation_effect/effect`,
            }))}
          />
          <RealtimeTextAreaInput
            fieldKey={`mutations/${firebaseIndex}/mutation_effect/description`}
            inputClass={styles.textarea}
            label="Description of Evidence"
            labelIcon={<GeneHistoryTooltip historyData={parsedHistoryList} location={`${getMutationName(mutation)}, Mutation Effect`} />}
            name="description"
            referenceText={mutation.mutation_effect.description}
          />
        </Collapsible>
        {mutation.tumors?.map((tumor, tumorIndex) => {
          const cancerTypeName = getCancerTypesNameWithExclusion(tumor.cancerTypes, tumor.excludedCancerTypes || [], true);
          const cancerTypeFirebasePath = buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}`);
          const cancerTypeContainsSpecialCancerType = tumorContainsSpecialCancerType(tumor);
          const currentTreatments = tumor.TIs.reduce<Treatment[]>((accumulator, currentTI) => {
            if (currentTI.treatments) {
              return accumulator.concat(currentTI.treatments);
            }
            return accumulator;
          }, []);

          return (
            <div key={tumor.cancerTypes_uuid} className="mb-2">
              <Collapsible
                className={'mt-2'}
                title={`Cancer Type: ${cancerTypeName}`}
                borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.CANCER_TYPE]]}
                info={<CancerTypeLevelSummary mutationUuid={mutation.name_uuid} cancerTypeUuid={tumor.cancerTypes_uuid} />}
                action={
                  <>
                    <GeneHistoryTooltip
                      key={'gene-history-tooltip'}
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutation)}, ${cancerTypeName}`}
                    />
                    <CommentIcon
                      id={tumor.cancerTypes_uuid}
                      comments={tumor.cancerTypes_comments || []}
                      onCreateComment={content =>
                        handleCreateComment(
                          `${cancerTypeFirebasePath}/cancerTypes_comments`,
                          content,
                          tumor.cancerTypes_comments?.length || 0
                        )
                      }
                      onDeleteComments={indices => handleDeleteComments(`${cancerTypeFirebasePath}/cancerTypes_comments`, indices)}
                      onResolveComment={index => handleResolveComment(`${cancerTypeFirebasePath}/cancerTypes_comments/${index}`)}
                      onUnresolveComment={index => handleUnresolveComment(`${cancerTypeFirebasePath}/cancerTypes_comments/${index}`)}
                    />
                    <EditIcon
                      onClick={() => {
                        modifyCancerTypeModalStore.openModal(tumor.cancerTypes_uuid);
                      }}
                    />
                    <DeleteSectionButton
                      sectionName={title}
                      deleteHandler={() => deleteSection(NestLevelType.CANCER_TYPE, cancerTypeFirebasePath)}
                      isRemovableWithoutReview={isSectionRemovableWithoutReview(data, NestLevelType.CANCER_TYPE, cancerTypeFirebasePath)}
                    />
                  </>
                }
                isSectionEmpty={isSectionEmpty(data, cancerTypeFirebasePath)}
                isPendingDelete={isPendingDelete(data, NestLevelType.CANCER_TYPE, cancerTypeFirebasePath)}
              >
                <RealtimeTextAreaInput
                  fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/summary`}
                  inputClass={styles.summaryTextarea}
                  label="Therapeutic Summary (Optional)"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutation)}, ${cancerTypeName}, Tumor Type Summary`}
                    />
                  }
                  name="txSummary"
                />
                <RealtimeTextAreaInput
                  fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnosticSummary`}
                  inputClass={styles.summaryTextarea}
                  label="Diagnostic Summary (Optional)"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutation)}, ${cancerTypeName}, Diagnostic Summary`}
                    />
                  }
                  name="dxSummary"
                />
                <RealtimeTextAreaInput
                  fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognosticSummary`}
                  inputClass={styles.summaryTextarea}
                  label="Prognostic Summary (Optional)"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutation)}, ${cancerTypeName}, Prognostic Summary`}
                    />
                  }
                  name="pxSummary"
                />
                <div className="mb-2">
                  <Collapsible
                    open
                    title="Therapeutic Implications"
                    borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.THERAPEUTIC]]}
                  >
                    {tumor.TIs.reduce((accumulator, ti, tiIndex) => {
                      if (!ti.treatments) {
                        return accumulator;
                      }
                      return accumulator.concat(
                        ti.treatments.map((treatment, treatmentIndex) => {
                          return {
                            tiIndex,
                            treatmentIndex,
                            treatment,
                          };
                        })
                      );
                    }, [])
                      .sort((txA, txB) => {
                        const compResult = sortByTxLevel(txA.treatment.level, txB.treatment.level);
                        if (compResult === 0) {
                          return getTxName(drugList, txA.treatment.name).localeCompare(getTxName(drugList, txB.treatment.name));
                        } else {
                          return compResult;
                        }
                      })
                      .map((treatmentObj, treatmentSortIndex) => {
                        const tiIndex = treatmentObj.tiIndex;
                        const treatmentIndex = treatmentObj.treatmentIndex;
                        const treatment = treatmentObj.treatment;
                        const therapyFirebasePath = buildFirebaseGenePath(
                          hugoSymbol,
                          `mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}`
                        );

                        const disableRctButton = cancerTypeContainsSpecialCancerType || treatment.level === 'no';
                        return (
                          <>
                            <Collapsible
                              className={classNames(treatmentSortIndex > 0 ? 'mt-2' : undefined)}
                              key={treatment.name_uuid}
                              title={`Therapy: ${getTxName(drugList, treatment.name)}`}
                              borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.THERAPY]]}
                              info={
                                <TreatmentLevelSummary
                                  mutationUuid={mutation.name_uuid}
                                  cancerTypesUuid={tumor.cancerTypes_uuid}
                                  treatmentUuid={treatment.name_uuid}
                                />
                              }
                              action={
                                <>
                                  <CommentIcon
                                    id={treatment.name_uuid}
                                    comments={treatment.name_comments || []}
                                    onCreateComment={content =>
                                      handleCreateComment(
                                        `${therapyFirebasePath}/name_comments`,
                                        content,
                                        treatment.name_comments?.length || 0
                                      )
                                    }
                                    onDeleteComments={indices => handleDeleteComments(`${therapyFirebasePath}/name_comments`, indices)}
                                    onResolveComment={index => handleResolveComment(`${therapyFirebasePath}/name_comments/${index}`)}
                                    onUnresolveComment={index => handleUnresolveComment(`${therapyFirebasePath}/name_comments/${index}`)}
                                  />
                                  <RCTButton
                                    tooltipProps={
                                      disableRctButton
                                        ? {
                                            overlay: cancerTypeContainsSpecialCancerType
                                              ? tooManyRCTsText
                                              : 'Add a highest level of evidence to view RCTs',
                                          }
                                        : null
                                    }
                                    disabled={disableRctButton}
                                    onClick={() => {
                                      relevantCancerTypesModalStore.openModal(
                                        `${therapyFirebasePath}/relevantCancerTypes`,
                                        tumor,
                                        treatment.level,
                                        treatment.relevantCancerTypes
                                      );
                                    }}
                                  />
                                  <EditIcon
                                    onClick={() => {
                                      modifyTherapyModalStore.openModal(treatment.name_uuid);
                                    }}
                                  />
                                  <DeleteSectionButton
                                    sectionName={title}
                                    deleteHandler={() => deleteSection(NestLevelType.THERAPY, therapyFirebasePath)}
                                    isRemovableWithoutReview={isSectionRemovableWithoutReview(
                                      data,

                                      NestLevelType.THERAPY,

                                      therapyFirebasePath
                                    )}
                                  />
                                </>
                              }
                              isSectionEmpty={isSectionEmpty(data, therapyFirebasePath)}
                              isPendingDelete={isPendingDelete(data, NestLevelType.THERAPY, therapyFirebasePath)}
                            >
                              <TherapyDropdownGroup
                                defaultLevel={treatment.level}
                                firebaseIndex={firebaseIndex}
                                tumorIndex={tumorIndex}
                                tiIndex={tiIndex}
                                treatmentIndex={treatmentIndex}
                              />
                              <RealtimeTextAreaInput
                                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/description`}
                                inputClass={styles.textarea}
                                label="Description of Evidence"
                                labelIcon={
                                  <GeneHistoryTooltip
                                    historyData={parsedHistoryList}
                                    location={`${CANCER_TYPE_THERAPY_INDENTIFIER}${getMutationName(mutation)}, ${cancerTypeName}, ${
                                      treatment.name
                                    }`}
                                  />
                                }
                                name="evidenceDescription"
                                referenceText={treatment.description}
                              />
                              <RealtimeTextAreaInput
                                fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tiIndex}/treatments/${treatmentIndex}/short`}
                                inputClass={styles.shortTextarea}
                                label="Additional Information (Optional)"
                                labelIcon={
                                  <GeneHistoryTooltip
                                    historyData={parsedHistoryList}
                                    location={`${CANCER_TYPE_THERAPY_INDENTIFIER}${getMutationName(mutation)}, ${cancerTypeName}, ${
                                      treatment.name
                                    }`}
                                  />
                                }
                                name="additionalEvidenceDescription"
                                referenceText={treatment.short}
                              />
                            </Collapsible>
                            <ModifyTherapyModal
                              treatmentUuid={treatment.name_uuid}
                              treatmentName={treatment.name}
                              drugList={drugList}
                              currentTreatments={currentTreatments}
                              onConfirm={async (treatmentName, newDrugs) => {
                                const newTreatment = _.cloneDeep(treatment);
                                newTreatment.name = treatmentName;

                                try {
                                  await Promise.all(newDrugs.map(drug => createDrug(drug)));
                                  await updateTreatment(therapyFirebasePath, newTreatment);
                                } catch (error) {
                                  notifyError(error);
                                }

                                modifyTherapyModalStore.closeModal();
                              }}
                              onCancel={modifyTherapyModalStore.closeModal}
                            />
                          </>
                        );
                      })}
                    <Button
                      className="mt-2"
                      outline
                      color="primary"
                      onClick={() => modifyTherapyModalStore.openModal(`new_treatment_for_${tumor.cancerTypes_uuid}`)}
                    >
                      Add Therapy
                    </Button>
                  </Collapsible>
                  <Collapsible
                    className={'mt-2'}
                    key={tumor.diagnostic_uuid}
                    title="Diagnostic Implication"
                    borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.DIAGNOSTIC]]}
                    action={
                      <>
                        <CommentIcon
                          id={tumor.diagnostic_uuid}
                          comments={tumor.diagnostic_comments || []}
                          onCreateComment={content =>
                            handleCreateComment(
                              `${cancerTypeFirebasePath}/diagnostic_comments`,
                              content,
                              tumor.diagnostic_comments?.length || 0
                            )
                          }
                          onDeleteComments={indices => handleDeleteComments(`${cancerTypeFirebasePath}/diagnostic_comments`, indices)}
                          onResolveComment={index => handleResolveComment(`${cancerTypeFirebasePath}/diagnostic_comments/${index}`)}
                          onUnresolveComment={index => handleUnresolveComment(`${cancerTypeFirebasePath}/diagnostic_comments/${index}`)}
                        />
                        <RCTButton
                          tooltipProps={
                            cancerTypeContainsSpecialCancerType || !tumor.diagnostic.level
                              ? { overlay: cancerTypeContainsSpecialCancerType ? tooManyRCTsText : 'Add a level of evidence to view RCTs' }
                              : null
                          }
                          disabled={!tumor.diagnostic.level || cancerTypeContainsSpecialCancerType}
                          onClick={() => {
                            relevantCancerTypesModalStore.openModal(
                              `${cancerTypeFirebasePath}/diagnostic/relevantCancerTypes`,
                              tumor,
                              tumor.diagnostic.level as DX_LEVELS,
                              tumor.diagnostic.relevantCancerTypes
                            );
                          }}
                        />
                      </>
                    }
                    isSectionEmpty={isSectionEmpty(
                      data,
                      buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic`)
                    )}
                  >
                    <RealtimeDropdownInput
                      fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic/level`}
                      label="Level of evidence"
                      name="level"
                      options={getLevelDropdownOptions(DIAGNOSTIC_LEVELS_ORDERING)}
                    />
                    <RealtimeTextAreaInput
                      fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/diagnostic/description`}
                      inputClass={styles.textarea}
                      label="Description of Evidence"
                      name="evidenceDescription"
                      referenceText={tumor.diagnostic.description}
                    />
                  </Collapsible>
                  <Collapsible
                    className={'mt-2'}
                    key={tumor.prognostic_uuid}
                    title="Prognostic Implication"
                    borderLeftColor={NestLevelColor[NestLevelMapping[NestLevelType.PROGNOSTIC]]}
                    action={
                      <>
                        <CommentIcon
                          id={tumor.prognostic_uuid}
                          comments={tumor.prognostic_comments || []}
                          onCreateComment={content =>
                            handleCreateComment(
                              `${cancerTypeFirebasePath}/prognostic_comments`,
                              content,
                              tumor.prognostic_comments?.length || 0
                            )
                          }
                          onDeleteComments={indices => handleDeleteComments(`${cancerTypeFirebasePath}/prognostic_comments`, indices)}
                          onResolveComment={index => handleResolveComment(`${cancerTypeFirebasePath}/prognostic_comments/${index}`)}
                          onUnresolveComment={index => handleUnresolveComment(`${cancerTypeFirebasePath}/prognostic_comments/${index}`)}
                        />
                        <RCTButton
                          tooltipProps={
                            cancerTypeContainsSpecialCancerType || !tumor.prognostic.level
                              ? { overlay: cancerTypeContainsSpecialCancerType ? tooManyRCTsText : 'Add a level of evidence to view RCTs' }
                              : null
                          }
                          disabled={!tumor.prognostic.level || cancerTypeContainsSpecialCancerType}
                          onClick={() => {
                            relevantCancerTypesModalStore.openModal(
                              `${cancerTypeFirebasePath}/prognostic/relevantCancerTypes`,
                              tumor,
                              tumor.prognostic.level as PX_LEVELS,
                              tumor.prognostic.relevantCancerTypes
                            );
                          }}
                        />
                      </>
                    }
                    isSectionEmpty={isSectionEmpty(
                      data,
                      buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic`)
                    )}
                  >
                    <RealtimeDropdownInput
                      fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic/level`}
                      label="Level of evidence"
                      name="level"
                      options={getLevelDropdownOptions(PROGNOSTIC_LEVELS_ORDERING)}
                    />
                    <RealtimeTextAreaInput
                      fieldKey={`mutations/${firebaseIndex}/tumors/${tumorIndex}/prognostic/description`}
                      inputClass={styles.textarea}
                      label="Description of Evidence"
                      name="evidenceDescription"
                      referenceText={tumor.prognostic.description}
                    />
                  </Collapsible>
                </div>
              </Collapsible>
              <ModifyTherapyModal
                treatmentUuid={`new_treatment_for_${tumor.cancerTypes_uuid}`}
                treatmentName=""
                drugList={drugList}
                currentTreatments={currentTreatments}
                onConfirm={async (treatmentName, newDrugs) => {
                  const newTreatment = new Treatment(treatmentName);

                  try {
                    await Promise.all(newDrugs.map(drug => createDrug(drug)));
                    await getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
                    await firebasePushToArray(
                      buildFirebaseGenePath(
                        hugoSymbol,
                        `mutations/${firebaseIndex}/tumors/${tumorIndex}/TIs/${tumor.TIs.length - 1}/treatments`
                      ),
                      [newTreatment]
                    );
                  } catch (error) {
                    notifyError(error);
                  }

                  modifyTherapyModalStore.closeModal();
                }}
                onCancel={modifyTherapyModalStore.closeModal}
              />
              <ModifyCancerTypeModal
                cancerTypesUuid={tumor.cancerTypes_uuid}
                includedCancerTypes={tumor.cancerTypes}
                excludedCancerTypes={tumor.excludedCancerTypes || []}
                onConfirm={async (includedCancerTypes, excludedCancerTypes) => {
                  const newTumor = _.cloneDeep(tumor);
                  newTumor.cancerTypes = includedCancerTypes;
                  newTumor.excludedCancerTypes = excludedCancerTypes;
                  if (!newTumor.excludedCancerTypes_uuid) {
                    newTumor.excludedCancerTypes_uuid = generateUuid();
                  }

                  try {
                    await updateTumor(cancerTypeFirebasePath, newTumor);
                  } catch (error) {
                    notifyError(error);
                  }

                  modifyCancerTypeModalStore.closeModal();
                }}
                onCancel={() => {
                  modifyCancerTypeModalStore.closeModal();
                }}
              />
            </div>
          );
        })}
        <Button
          className={'mt-2'}
          outline
          color="primary"
          onClick={() => modifyCancerTypeModalStore.openModal(`new_cancer_type_for_${mutation.name_uuid}`)}
        >
          Add Cancer Type
        </Button>
        <ModifyCancerTypeModal
          cancerTypesUuid={`new_cancer_type_for_${mutation.name_uuid}`}
          includedCancerTypes={[]}
          excludedCancerTypes={[]}
          onConfirm={async (includedCancerTypes, excludedCancerTypes) => {
            const newTumor = new Tumor();
            newTumor.cancerTypes = includedCancerTypes;
            newTumor.excludedCancerTypes = excludedCancerTypes;

            try {
              await firebasePushToArray(buildFirebaseGenePath(hugoSymbol, `mutations/${firebaseIndex}/tumors`), [newTumor]);
            } catch (error) {
              notifyError(error);
            }

            modifyCancerTypeModalStore.closeModal();
          }}
          onCancel={() => {
            modifyCancerTypeModalStore.closeModal();
          }}
        />
      </Collapsible>
      {isEditingMutation ? (
        <AddMutationModal
          mutationList={mutationList}
          vusList={vusList}
          hugoSymbol={hugoSymbol}
          mutationToEdit={isEditingMutation ? mutation : null}
          onConfirm={async alterations => {
            const newMutation = _.cloneDeep(mutation);
            newMutation.name = alterations.map(alteration => alteration.name).join(', ');
            newMutation.alterations = alterations;

            try {
              await updateMutation(mutationFirebasePath, newMutation);
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
  firebaseGeneStore,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  authStore,
  drugStore,
}: IRootStore) => ({
  data: firebaseGeneStore.data,
  hugoSymbol: firebaseGeneStore.hugoSymbol,
  deleteSection: firebaseGeneStore.deleteSection,
  updateTumor: firebaseGeneStore.updateTumor,
  updateTreatment: firebaseGeneStore.updateTreatment,
  updateMutation: firebaseGeneStore.updateMutation,
  firebasePushToArray: firebaseGeneStore.pushToArray,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  handleFirebaseDeleteFromArray: firebaseGeneStore.deleteFromArray,
  handleFirebaseUpdateUntemplated: firebaseGeneStore.updateUntemplated,
  account: authStore.account,
  createDrug: drugStore.createEntity,
  getDrugs: drugStore.getEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsible));
