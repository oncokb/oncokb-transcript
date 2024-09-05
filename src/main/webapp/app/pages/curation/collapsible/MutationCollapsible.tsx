import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import CancerRiskTabs from 'app/components/tabs/CancerRiskTabs';
import { RADIO_OPTION_NONE } from 'app/config/constants/constants';
import {
  INHERITANCE_MECHANISM_OPTIONS,
  MUTATION_EFFECT_OPTIONS,
  ONCOGENICITY_OPTIONS,
  PATHOGENICITY_OPTIONS,
  PENETRANCE_OPTIONS,
  READABLE_FIELD,
} from 'app/config/constants/firebase';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { AlterationAnnotationStatus, HotspotDTO, ProteinExonDTO } from 'app/shared/api/generated/curation';
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import CommentIcon from 'app/shared/icons/CommentIcon';
import EditIcon from 'app/shared/icons/EditIcon';
import HotspotIcon from 'app/shared/icons/HotspotIcon';
import MutationConvertIcon from 'app/shared/icons/MutationConvertIcon';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import AddVusModal from 'app/shared/modal/AddVusModal';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { Alteration, Review } from 'app/shared/model/firebase/firebase.model';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import {
  getFirebaseGenePath,
  getFirebaseVusPath,
  getMutationName,
  hasMultipleMutations,
  isMutationEffectCuratable,
  isSectionRemovableWithoutReview,
} from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { getExonRanges } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { get, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'reactstrap';
import BadgeGroup from '../BadgeGroup';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import FirebaseList from '../list/FirebaseList';
import MutationLastModified from '../mutation/mutation-last-modified';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import * as styles from '../styles.module.scss';
import CancerTypeCollapsible from './CancerTypeCollapsible';
import Collapsible from './Collapsible';
import { NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import { RemovableCollapsible } from './RemovableCollapsible';
import { Unsubscribe } from 'firebase/database';
import { getLocationIdentifier } from 'app/components/geneHistoryTooltip/gene-history-tooltip-utils';

export interface IMutationCollapsibleProps extends StoreProps {
  mutationPath: string;
  hugoSymbol: string;
  isGermline: boolean;
  open?: boolean;
  disableOpen?: boolean;
  onToggle?: () => void;
  parsedHistoryList: Map<string, FlattenedHistory[]> | undefined;
  showLastModified?: boolean;
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
  annotatedAltsCache,
  genomicIndicators,
  showLastModified,
}: IMutationCollapsibleProps) => {
  const firebaseMutationsPath = `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`;

  const [mutationUuid, setMutationUuid] = useState<string>('');
  const [mutationName, setMutationName] = useState<string>('');
  const [mutationNameReview, setMutationNameReview] = useState<Review | null>(null);
  const [mutationAlterations, setMutationAlterations] = useState<Alteration[] | null>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);
  const [relatedAnnotationResult, setRelatedAnnotationResult] = useState<AlterationAnnotationStatus[]>([]);

  useEffect(() => {
    const arr = annotatedAltsCache?.get(hugoSymbol ?? '', [{ name: mutationName, alterations: mutationAlterations }]) ?? [];
    setRelatedAnnotationResult(arr.filter((x): x is AlterationAnnotationStatus => x !== undefined && x !== null));
  }, [annotatedAltsCache?.loading, mutationName, mutationAlterations]);

  const exons = useMemo(() => {
    return _.uniqBy(
      relatedAnnotationResult.reduce((acc, next) => {
        if (next.annotation?.exons) {
          acc.push(...next.annotation.exons);
        }
        return acc;
      }, [] as ProteinExonDTO[]),
      'exon',
    ).sort((a, b) => (a.range?.start ?? Number.MAX_VALUE) - (b.range?.start ?? Number.MAX_VALUE));
  }, [relatedAnnotationResult]);

  const exonRanges = useMemo(() => {
    return getExonRanges(exons.filter(x => x !== undefined));
  }, [exons]);

  const hotspots = useMemo(() => {
    return _.uniq(
      relatedAnnotationResult.reduce((acc, next) => {
        if (next.annotation?.hotspot?.associatedHotspots) {
          acc.push(...next.annotation.hotspot.associatedHotspots);
        }
        return acc;
      }, [] as HotspotDTO[]),
    );
  }, [relatedAnnotationResult]);

  const associatedGenomicIndicatorUuids = useMemo(() => {
    if (!isGermline || !genomicIndicators) {
      return [];
    }

    const associatedIndicators: string[] = [];
    for (const genomicIndicator of genomicIndicators) {
      for (const variant of genomicIndicator.associationVariants || []) {
        if (mutationUuid === variant.uuid) {
          associatedIndicators.push(genomicIndicator.name_uuid);
        }
      }
    }
    return associatedIndicators;
  }, [genomicIndicators, mutationUuid]);

  const isAssociatedWithGenomicIndicator = associatedGenomicIndicatorUuids.length > 0;

  const [vusData, setVusData] = useState(null);

  const [isEditingMutation, setIsEditingMutation] = useState(false);
  const [isConvertingToVus, setIsConvertingToVus] = useState(false);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, getFirebaseVusPath(isGermline, hugoSymbol)), snapshot => {
        setVusData(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/name`), snapshot => {
        setMutationName(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/alterations`), snapshot => {
        setMutationAlterations(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${mutationPath}/name_review`), snapshot => {
        const review = snapshot.val() as Review;
        setMutationNameReview(review);
        setIsRemovableWithoutReview(isSectionRemovableWithoutReview(review));
      }),
    );

    onValue(
      ref(firebaseDb, `${mutationPath}/name_uuid`),
      snapshot => {
        setMutationUuid(snapshot.val());
      },
      { onlyOnce: true },
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [mutationPath, firebaseDb]);

  const cancerTypeCollapsibleBuilder = useCallback(
    index => {
      return (
        <CancerTypeCollapsible
          allCancerTypesPath={`${mutationPath}/tumors`}
          cancerTypePath={`${mutationPath}/tumors/${index}`}
          mutationName={mutationName}
          mutationUuid={mutationUuid}
          parsedHistoryList={parsedHistoryList}
          isGermline={isGermline}
        />
      );
    },
    [mutationPath, mutationName, parsedHistoryList],
  );

  async function handleDeleteMutation(toVus = false) {
    if (!firebaseDb) {
      return;
    }
    const snapshot = await get(ref(firebaseDb, mutationPath));
    await deleteSection?.(`${mutationPath}/name`, snapshot.val(), mutationNameReview, mutationUuid, toVus);
    if (toVus) setIsConvertingToVus(false);
  }

  if (_.isNil(mutationUuid) || (_.isNil(mutationName) && open)) {
    onToggle?.();
  }

  if (!mutationUuid || !mutationName) {
    return <></>;
  }

  const title = getMutationName(mutationName, mutationAlterations);
  const isStringMutation = title.includes(',');
  const isMECuratable = isMutationEffectCuratable(title);
  const isMutationPendingDelete = mutationNameReview?.removed || false;

  return (
    <>
      <RemovableCollapsible
        idPrefix={title}
        title={title}
        defaultOpen={open}
        collapsibleClassName="mb-1"
        colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.MUTATION]] }}
        review={mutationNameReview}
        disableOpen={disableOpen}
        onToggle={() => !isMutationPendingDelete && onToggle?.()}
        info={
          <>
            {showLastModified && (
              <MutationLastModified className="me-2" mutationUuid={mutationUuid} hugoSymbol={hugoSymbol ?? ''} isGermline={isGermline} />
            )}
            <MutationLevelSummary mutationPath={mutationPath} hideOncogenicity={isStringMutation} />
            {hotspots.length > 0 && <HotspotIcon associatedHotspots={hotspots} />}
            {exonRanges.length > 0 && (
              <DefaultTooltip
                overlay={() => {
                  return (
                    <div className={'d-flex flex-column'}>
                      {exons
                        .filter(
                          (exon): exon is ProteinExonDTO & { range: NonNullable<ProteinExonDTO['range']> } => exon.range !== undefined,
                        )
                        .map(exon => (
                          <div key={exon.exon}>
                            <b>Exon {exon.exon}</b>: {exon.range.start}~{exon.range.end}
                          </div>
                        ))}
                    </div>
                  );
                }}
              >
                <div className={'mx-1 text-nowrap'}>Exon: {exonRanges.join(', ')}</div>
              </DefaultTooltip>
            )}
          </>
        }
        action={
          <>
            <GeneHistoryTooltip
              key={'gene-history-tooltip'}
              historyData={parsedHistoryList}
              location={getMutationName(mutationName, mutationAlterations)}
              locationIdentifier={getLocationIdentifier({ mutationUuid })}
            />
            <CommentIcon id={mutationUuid} path={`${mutationPath}/name_comments`} />
            <MutationConvertIcon
              mutationName={mutationName}
              mutationNameReview={mutationNameReview}
              tooltipProps={{ overlay: <div>Demote alteration(s) to VUS</div> }}
              onClick={() => setIsConvertingToVus(true)}
            />
            <EditIcon
              onClick={() => {
                setIsEditingMutation(true);
              }}
              tooltipProps={
                isAssociatedWithGenomicIndicator
                  ? { overlay: <span>Cannot modify because mutation is associated with genomic indicator(s)</span> }
                  : null
              }
              disabled={isAssociatedWithGenomicIndicator}
            />
            <DeleteSectionButton
              sectionName={title}
              deleteHandler={() => handleDeleteMutation()}
              isRemovableWithoutReview={isRemovableWithoutReview}
              tooltipProps={
                isAssociatedWithGenomicIndicator
                  ? { overlay: <span>Cannot delete because mutation is associated with genomic indicator(s)</span> }
                  : null
              }
              disabled={isAssociatedWithGenomicIndicator}
            />
          </>
        }
        badge={
          <BadgeGroup
            firebasePath={mutationPath}
            showDemotedBadge={mutationNameReview?.demotedToVus || false}
            showDeletedBadge={isMutationPendingDelete}
          />
        }
        isPendingDelete={isMutationPendingDelete}
      >
        <RealtimeTextAreaInput
          firebasePath={`${mutationPath}/summary`}
          inputClass={styles.summaryTextarea}
          label="Mutation Summary (Optional)"
          labelIcon={
            <GeneHistoryTooltip
              historyData={parsedHistoryList}
              location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.SUMMARY}`}
              locationIdentifier={getLocationIdentifier({
                mutationUuid,
                fields: [READABLE_FIELD.SUMMARY],
              })}
            />
          }
          name="summary"
          parseRefs
        />
        <Collapsible
          idPrefix={`${mutationName}-mutation-effect`}
          title="Mutation Effect"
          defaultOpen={isMECuratable}
          colorOptions={{
            borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.MUTATION_EFFECT]],
          }}
          displayOptions={{ disableCollapsible: !isMECuratable }}
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
                      location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_EFFECT}, ${
                        READABLE_FIELD.PATHOGENIC
                      }`}
                      locationIdentifier={getLocationIdentifier({
                        mutationUuid,
                        fields: [READABLE_FIELD.MUTATION_EFFECT, READABLE_FIELD.PATHOGENIC],
                      })}
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
                        location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_EFFECT}, ${
                          READABLE_FIELD.ONCOGENIC
                        }`}
                        locationIdentifier={getLocationIdentifier({
                          mutationUuid,
                          fields: [READABLE_FIELD.MUTATION_EFFECT, READABLE_FIELD.ONCOGENIC],
                        })}
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
                        location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_EFFECT}, ${
                          READABLE_FIELD.EFFECT
                        }`}
                        locationIdentifier={getLocationIdentifier({
                          mutationUuid,
                          fields: [READABLE_FIELD.MUTATION_EFFECT, READABLE_FIELD.EFFECT],
                        })}
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
                location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_EFFECT}, ${
                  READABLE_FIELD.DESCRIPTION
                }`}
                locationIdentifier={getLocationIdentifier({
                  mutationUuid,
                  fields: [READABLE_FIELD.MUTATION_EFFECT, READABLE_FIELD.DESCRIPTION],
                })}
              />
            }
            name="description"
            parseRefs
          />
        </Collapsible>
        {isGermline && (
          <>
            <Collapsible
              idPrefix={`${mutationName}-penetrance`}
              collapsibleClassName="mt-2"
              title={'Mutation Specific Penetrance'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.PENETRANCE]] }}
              badge={<BadgeGroup firebasePath={`${mutationPath}/mutation_specific_penetrance`} />}
            >
              <>
                <RealtimeCheckedInputGroup
                  groupHeader={
                    <>
                      <span style={{ marginRight: '8px' }}>Penetrance</span>
                      {
                        <GeneHistoryTooltip
                          historyData={parsedHistoryList}
                          location={`${getMutationName(mutationName, mutationAlterations)}, ${
                            READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE
                          }, ${READABLE_FIELD.PENETRANCE}`}
                          locationIdentifier={getLocationIdentifier({
                            mutationUuid,
                            fields: [READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE, READABLE_FIELD.PENETRANCE],
                          })}
                        />
                      }
                    </>
                  }
                  isRadio
                  options={[...PENETRANCE_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${mutationPath}/mutation_specific_penetrance/penetrance`,
                  }))}
                />
                <RealtimeTextAreaInput
                  firebasePath={`${mutationPath}/mutation_specific_penetrance/description`}
                  inputClass={styles.textarea}
                  label="Description of Penetrance"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE}, ${
                        READABLE_FIELD.DESCRIPTION
                      }`}
                      locationIdentifier={getLocationIdentifier({
                        mutationUuid,
                        fields: [READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE, READABLE_FIELD.DESCRIPTION],
                      })}
                    />
                  }
                  name="description"
                  parseRefs
                />
              </>
            </Collapsible>
            <Collapsible
              idPrefix={`${mutationName}-mechanism-of-inheritance`}
              collapsibleClassName="mt-2"
              title={'Mutation Specific Mechanism of Inheritance'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.INHERITANCE_MECHANISM]] }}
              badge={<BadgeGroup firebasePath={`${mutationPath}/mutation_specific_inheritance_mechanism`} />}
            >
              <>
                <RealtimeCheckedInputGroup
                  groupHeader={
                    <>
                      <span style={{ marginRight: '8px' }}>Mechanism of Inheritance</span>
                      {
                        <GeneHistoryTooltip
                          historyData={parsedHistoryList}
                          location={`${getMutationName(mutationName, mutationAlterations)}, ${
                            READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE
                          }, ${READABLE_FIELD.INHERITANCE_MECHANISM}`}
                          locationIdentifier={getLocationIdentifier({
                            mutationUuid,
                            fields: [READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE, READABLE_FIELD.INHERITANCE_MECHANISM],
                          })}
                        />
                      }
                    </>
                  }
                  isRadio
                  options={[...INHERITANCE_MECHANISM_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${mutationPath}/mutation_specific_inheritance_mechanism/inheritanceMechanism`,
                  }))}
                />
                <RealtimeTextAreaInput
                  firebasePath={`${mutationPath}/mutation_specific_inheritance_mechanism/description`}
                  inputClass={styles.textarea}
                  label="Description of Inheritance Mechanism"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE}, ${
                        READABLE_FIELD.DESCRIPTION
                      }`}
                      locationIdentifier={getLocationIdentifier({
                        mutationUuid,
                        fields: [READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE, READABLE_FIELD.DESCRIPTION],
                      })}
                    />
                  }
                  name="description"
                  parseRefs
                />
              </>
            </Collapsible>
            <Collapsible
              idPrefix={`${mutationName}-cancer-risk`}
              collapsibleClassName="mt-2"
              title={'Mutation Specific Cancer Risk'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.CANCER_RISK]] }}
              badge={<BadgeGroup firebasePath={`${mutationPath}/mutation_specific_cancer_risk`} />}
            >
              <CancerRiskTabs cancerRiskPath={`${mutationPath}/mutation_specific_cancer_risk`} textAreaClass={styles.textarea} />
            </Collapsible>
          </>
        )}
        <FirebaseList path={`${mutationPath}/tumors`} pushDirection="back" itemBuilder={cancerTypeCollapsibleBuilder} />
        <Button
          className={'mt-2 mb-1'}
          outline
          color="primary"
          onClick={() => modifyCancerTypeModalStore?.openModal(`new_cancer_type_for_${mutationUuid}`)}
        >
          Add Cancer Type
        </Button>
      </RemovableCollapsible>
      <ModifyCancerTypeModal
        cancerTypesUuid={`new_cancer_type_for_${mutationUuid}`}
        allCancerTypesPath={`${mutationPath}/tumors`}
        onConfirm={async newTumor => {
          try {
            await addTumor?.(`${mutationPath}/tumors`, newTumor, isGermline);
          } catch (error) {
            notifyError(error);
          }

          modifyCancerTypeModalStore?.closeModal();
        }}
        onCancel={() => {
          modifyCancerTypeModalStore?.closeModal();
        }}
      />
      {isEditingMutation ? (
        <AddMutationModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          mutationToEditPath={isEditingMutation ? mutationPath : null}
          onConfirm={async newMutation => {
            try {
              await updateMutationName?.(mutationPath, firebaseMutationsPath, mutationName, newMutation);
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
      {isConvertingToVus ? (
        <AddVusModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          vusList={vusData}
          onCancel={() => setIsConvertingToVus(false)}
          onConfirm={() => handleDeleteMutation(true)}
          convertOptions={{
            initialAlterations: mutationName.split(',').map(alteration => alteration.trim()),
            isConverting: true,
            mutationUuid,
          }}
        />
      ) : undefined}
    </>
  );
};

const mapStoreToProps = ({
  firebaseAppStore,
  firebaseGeneService,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  drugStore,
  curationPageStore,
  firebaseGenomicIndicatorsStore,
}: IRootStore) => ({
  deleteSection: firebaseGeneService.deleteSection,
  addTumor: firebaseGeneService.addTumor,
  updateMutationName: firebaseGeneService.updateMutationName,
  modifyCancerTypeModalStore,
  modifyTherapyModalStore,
  relevantCancerTypesModalStore,
  createDrug: drugStore.createEntity,
  getDrugs: drugStore.getEntities,
  firebaseDb: firebaseAppStore.firebaseDb,
  annotatedAltsCache: curationPageStore.annotatedAltsCache,
  genomicIndicators: firebaseGenomicIndicatorsStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsible));
