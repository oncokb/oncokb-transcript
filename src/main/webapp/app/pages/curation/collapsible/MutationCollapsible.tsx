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
import { RealtimeCheckedInputGroup, RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import CommentIcon from 'app/shared/icons/CommentIcon';
import EditIcon from 'app/shared/icons/EditIcon';
import MutationConvertIcon from 'app/shared/icons/MutationConvertIcon';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import AddVusModal from 'app/shared/modal/AddVusModal';
import ModifyCancerTypeModal from 'app/shared/modal/ModifyCancerTypeModal';
import { Alteration, Review } from 'app/shared/model/firebase/firebase.model';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import {
  getFirebaseGenePath,
  getFirebaseVusPath,
  getMutationName,
  isMutationEffectCuratable,
  isSectionRemovableWithoutReview,
} from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import BadgeGroup from '../BadgeGroup';
import { DeleteSectionButton } from '../button/DeleteSectionButton';
import FirebaseList from '../list/FirebaseList';
import MutationLevelSummary from '../nestLevelSummary/MutationLevelSummary';
import styles from '../styles.module.scss';
import CancerTypeCollapsible from './CancerTypeCollapsible';
import Collapsible from './Collapsible';
import { RemovableCollapsible } from './RemovableCollapsible';
import {  NestLevelColor, NestLevelMapping, NestLevelType } from './NestLevel';
import { AlterationAnnotationStatus, HotspotDTO, ProteinExonDTO } from 'app/shared/api/generated';
import _ from 'lodash';
import { getExonRanges } from 'app/shared/util/utils';
import HotspotIcon from 'app/shared/icons/HotspotIcon';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { FirebaseVusService } from 'app/service/firebase/firebase-vus-service';

export interface IMutationCollapsibleProps extends StoreProps {
  mutationPath: string;
  hugoSymbol: string;
  isGermline: boolean;
  open?: boolean;
  disableOpen?: boolean;
  onToggle?: () => void;
  parsedHistoryList: Map<string, FlattenedHistory[]>;
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
}: IMutationCollapsibleProps) => {
  const firebaseVusPath = getFirebaseVusPath(isGermline, hugoSymbol);
  const firebaseMutationsPath = `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`;

  const [mutationUuid, setMutationUuid] = useState<string>(null);
  const [mutationName, setMutationName] = useState<string>(null);
  const [mutationNameReview, setMutationNameReview] = useState<Review>(null);
  const [mutationAlterations, setMutationAlterations] = useState<Alteration[]>(null);
  const [isRemovableWithoutReview, setIsRemovableWithoutReview] = useState(false);
  const [relatedAnnotationResult, setRelatedAnnotationResult] = useState<AlterationAnnotationStatus[]>([]);

  useEffect(() => {
    setRelatedAnnotationResult(annotatedAltsCache.get(hugoSymbol, [{ name: mutationName, alterations: mutationAlterations }]));
  }, [annotatedAltsCache.loading, mutationName, mutationAlterations]);

  const exons = useMemo(() => {
    return _.uniqBy(
      relatedAnnotationResult.reduce((acc, next) => {
        acc.push(...next.annotation.exons);
        return acc;
      }, [] as ProteinExonDTO[]),
      'exon'
    ).sort((a, b) => a.range.start - b.range.start);
  }, [relatedAnnotationResult]);

  const exonRanges = useMemo(() => {
    return getExonRanges(exons);
  }, [exons]);

  const hotspots = useMemo(() => {
    return _.uniq(
      relatedAnnotationResult.reduce((acc, next) => {
        acc.push(...next.annotation.hotspot?.associatedHotspots);
        return acc;
      }, [] as HotspotDTO[])
    );
  }, [relatedAnnotationResult]);

  const [vusData, setVusData] = useState(null);

  const [isEditingMutation, setIsEditingMutation] = useState(false);
  const [isConvertingToVus, setIsConvertingToVus] = useState(false);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, getFirebaseVusPath(isGermline, hugoSymbol)), snapshot => {
        setVusData(snapshot.val());
      })
    );
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

  async function handleDemoteToVus() {
    await deleteSection(`${mutationPath}/name`, mutationNameReview, mutationUuid, true);
    setIsConvertingToVus(false);
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
        title={title}
        defaultOpen={open}
        collapsibleClassName="mb-1"
        colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.MUTATION]] }}
        review={mutationNameReview}
        disableOpen={disableOpen}
        onToggle={() => !isMutationPendingDelete && onToggle()}
        info={
          <>
            <MutationLevelSummary mutationPath={mutationPath} hideOncogenicity={isStringMutation} />
            {hotspots.length > 0 && <HotspotIcon associatedHotspots={hotspots} />}
            {exonRanges.length > 0 && (
              <DefaultTooltip
                overlay={() => {
                  return (
                    <div className={'d-flex flex-column'}>
                      {exons.map(exon => (
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
            />
            <CommentIcon id={mutationUuid} path={`${mutationPath}/name_comments`} />
            <MutationConvertIcon
              convertTo="vus"
              firebaseMutationsPath={firebaseMutationsPath}
              mutationName={mutationName}
              mutationNameReview={mutationNameReview}
              mutationUuid={mutationUuid}
              tooltipProps={{ overlay: <div>Convert alteration(s) to VUS</div> }}
              onClick={() => setIsConvertingToVus(true)}
            />
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
        badge={
          <BadgeGroup
            firebasePath={mutationPath}
            showDemotedBadge={mutationNameReview?.demotedToVus || false}
            showDeletedBadge={isMutationPendingDelete}
          />
        }
        isPendingDelete={isMutationPendingDelete}
      >
        <Collapsible
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
                        location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_EFFECT}`}
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
              />
            }
            name="description"
            parseRefs
          />
        </Collapsible>
        {isGermline && (
          <>
            <Collapsible
              collapsibleClassName="mt-2"
              title={'Mutation Specific Penetrance'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.PENETRANCE]] }}
              badge={<BadgeGroup firebasePath={`${mutationPath}/penetrance`} />}
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
                        />
                      }
                    </>
                  }
                  isRadio
                  options={[...PENETRANCE_OPTIONS, RADIO_OPTION_NONE].map(label => ({
                    label,
                    firebasePath: `${mutationPath}/penetrance/penetrance`,
                  }))}
                />
                <RealtimeTextAreaInput
                  firebasePath={`${mutationPath}/penetrance/description`}
                  inputClass={styles.textarea}
                  label="Description of Penetrance"
                  labelIcon={
                    <GeneHistoryTooltip
                      historyData={parsedHistoryList}
                      location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE}, ${
                        READABLE_FIELD.DESCRIPTION
                      }`}
                    />
                  }
                  name="description"
                  parseRefs
                />
              </>
            </Collapsible>
            <Collapsible
              collapsibleClassName="mt-2"
              title={'Mutation Specific Mechanism of Inheritance'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.INHERITANCE_MECHANISM]] }}
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
                          location={`${getMutationName(mutationName, mutationAlterations)}, ${
                            READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE
                          }, ${READABLE_FIELD.INHERITANCE_MECHANISM}`}
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
                      location={`${getMutationName(mutationName, mutationAlterations)}, ${READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE}, ${
                        READABLE_FIELD.DESCRIPTION
                      }`}
                    />
                  }
                  name="description"
                  parseRefs
                />
              </>
            </Collapsible>
            <Collapsible
              collapsibleClassName="mt-2"
              title={'Mutation Specific Cancer Risk'}
              colorOptions={{ borderLeftColor: NestLevelColor[NestLevelMapping[NestLevelType.CANCER_RISK]] }}
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
      </RemovableCollapsible>
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
      {isConvertingToVus ? (
        <AddVusModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          vusList={vusData}
          onCancel={() => setIsConvertingToVus(false)}
          onConfirm={handleDemoteToVus}
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
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsible));
