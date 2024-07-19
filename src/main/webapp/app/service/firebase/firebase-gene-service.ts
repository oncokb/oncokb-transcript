import {
  CancerType,
  DX_LEVELS,
  Drug,
  FIREBASE_ONCOGENICITY,
  Gene,
  GenomicIndicator,
  Mutation,
  PX_LEVELS,
  Review,
  TX_LEVELS,
  Treatment,
  Tumor,
  Vus,
} from 'app/shared/model/firebase/firebase.model';
import { isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
import { extractArrayPath, parseFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import {
  findNestedUuids,
  getFirebaseGenePath,
  getFirebaseVusPath,
  isSectionRemovableWithoutReview,
} from 'app/shared/util/firebase/firebase-utils';
import AuthStore from '../../stores/authentication.store';
import { FirebaseRepository } from '../../stores/firebase/firebase-repository';
import { FirebaseMetaService } from './firebase-meta-service';
import { ALLELE_STATE, FB_COLLECTION, PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { isPromiseOk } from 'app/shared/util/utils';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { getErrorMessage } from 'app/oncokb-commons/components/alert/ErrorAlertUtils';
import { FirebaseDataStore } from 'app/stores/firebase/firebase-data.store';
import { getUpdatedReview } from 'app/shared/util/firebase/firebase-review-utils';
import { SentryError } from 'app/config/sentry-error';
import { GERMLINE_PATH } from 'app/config/constants/constants';
import _ from 'lodash';
import { getDriveAnnotations } from 'app/shared/util/core-drive-annotation-submission/core-drive-annotation-submission';
import { DriveAnnotationApi } from 'app/shared/api/manual/drive-annotation-api';

export type AllLevelSummary = {
  [mutationUuid: string]: {
    [cancerTypesUuid: string]: {
      TT: number;
      oncogenicity: FIREBASE_ONCOGENICITY | '';
      TTS: number;
      DxS: number;
      PxS: number;
      txLevels: TX_LEVELS[];
      dxLevels: DX_LEVELS[];
      pxLevels: PX_LEVELS[];
      treatmentSummary: { [treatmentId: string]: TX_LEVELS[] };
    };
  };
};

export type MutationLevelSummary = {
  [mutationUuid: string]: {
    TT: number;
    oncogenicity: FIREBASE_ONCOGENICITY | '';
    mutationEffect: string;
    TTS: number;
    DxS: number;
    PxS: number;
    txLevels: { [txLevel in TX_LEVELS]: number };
    dxLevels: { [dxLevel in DX_LEVELS]: number };
    pxLevels: { [pxLevel in PX_LEVELS]: number };
  };
};

export class FirebaseGeneService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;
  firebaseMutationConvertIconStore: FirebaseDataStore<Mutation[]>;
  firebaseMetaService: FirebaseMetaService;
  firebaseGeneReviewService: FirebaseGeneReviewService;
  driveAnnotationApi: DriveAnnotationApi;

  constructor(
    firebaseRepository: FirebaseRepository,
    authStore: AuthStore,
    firebaseMutationConvertIconStore: FirebaseDataStore<Mutation[]>,
    firebaseMetaService: FirebaseMetaService,
    firebaseGeneReviewService: FirebaseGeneReviewService,
    driveAnnotationApi: DriveAnnotationApi,
  ) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
    this.firebaseMutationConvertIconStore = firebaseMutationConvertIconStore;
    this.firebaseMetaService = firebaseMetaService;
    this.firebaseGeneReviewService = firebaseGeneReviewService;
    this.driveAnnotationApi = driveAnnotationApi;
  }

  getAllLevelMutationSummaryStats = (mutations: Mutation[]) => {
    const summary: AllLevelSummary = {};
    if (mutations) {
      mutations.forEach(mutation => {
        summary[mutation.name_uuid] = {};
        if (mutation.tumors) {
          mutation.tumors.forEach(tumor => {
            summary[mutation.name_uuid][tumor.cancerTypes_uuid] = {
              TT: 0,
              oncogenicity: '',
              TTS: 0,
              DxS: 0,
              PxS: 0,
              txLevels: [],
              dxLevels: [],
              pxLevels: [],
              treatmentSummary: {},
            };
            summary[mutation.name_uuid][tumor.cancerTypes_uuid].TT++;
            summary[mutation.name_uuid][tumor.cancerTypes_uuid].oncogenicity = mutation.mutation_effect.oncogenic;
            if (tumor.summary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].TTS++;
            }
            if (tumor.diagnosticSummary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].DxS++;
            }
            if (tumor.prognosticSummary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].PxS++;
            }
            tumor.TIs.forEach(ti => {
              if (ti.treatments) {
                ti.treatments.forEach(treatment => {
                  const cancerTypeSummary = summary[mutation.name_uuid][tumor.cancerTypes_uuid];
                  cancerTypeSummary.txLevels.push(treatment.level);

                  if (!cancerTypeSummary.treatmentSummary[treatment.name_uuid]) {
                    cancerTypeSummary.treatmentSummary[treatment.name_uuid] = [];
                  }
                  cancerTypeSummary.treatmentSummary[treatment.name_uuid].push(treatment.level);
                });
              }
            });
            if (tumor?.diagnostic?.level) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].dxLevels.push(tumor.diagnostic.level as DX_LEVELS);
            }
            if (tumor?.prognostic?.level) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].pxLevels.push(tumor.prognostic.level as PX_LEVELS);
            }
          });
        }
      });
    }
    return summary;
  };

  getMutationLevelMutationSummaryStats = (mutations: Mutation[]) => {
    const summary: MutationLevelSummary = {};
    if (mutations) {
      mutations.forEach(mutation => {
        summary[mutation.name_uuid] = {
          TT: 0,
          oncogenicity: mutation.mutation_effect.oncogenic,
          mutationEffect: mutation.mutation_effect.effect,
          TTS: 0,
          DxS: 0,
          PxS: 0,
          txLevels: {} as { [txLevel in TX_LEVELS]: number },
          dxLevels: {} as { [dxLevel in DX_LEVELS]: number },
          pxLevels: {} as { [pxLevel in PX_LEVELS]: number },
        };
        if (mutation.tumors) {
          mutation.tumors.forEach(tumor => {
            summary[mutation.name_uuid].TT++;
            if (tumor.summary) {
              summary[mutation.name_uuid].TTS++;
            }
            if (tumor.diagnosticSummary) {
              summary[mutation.name_uuid].DxS++;
            }
            if (tumor.prognosticSummary) {
              summary[mutation.name_uuid].PxS++;
            }
            tumor.TIs.forEach(ti => {
              if (ti.treatments) {
                ti.treatments.forEach(treatment => {
                  if (isTxLevelPresent(treatment.level)) {
                    if (!summary[mutation.name_uuid].txLevels[treatment.level]) {
                      summary[mutation.name_uuid].txLevels[treatment.level] = 1;
                    } else {
                      summary[mutation.name_uuid].txLevels[treatment.level]++;
                    }
                  }
                });
              }
            });
            if (tumor?.diagnostic?.level) {
              if (!summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level]) {
                summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level] = 1;
              } else {
                summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level]++;
              }
            }
            if (tumor?.prognostic?.level) {
              if (!summary[mutation.name_uuid].dxLevels[tumor.prognostic.level]) {
                summary[mutation.name_uuid].dxLevels[tumor.prognostic.level] = 1;
              } else {
                summary[mutation.name_uuid].dxLevels[tumor.prognostic.level]++;
              }
            }
          });
        }
      });
    }
    return summary;
  };

  deleteSection = async (
    path: string,
    sectionObject: Mutation | Tumor | Treatment | GenomicIndicator,
    review: Review,
    uuid: string,
    isDemotedToVus = false,
  ) => {
    const isGermline = path.toLowerCase().includes(GERMLINE_PATH);
    const name = this.authStore.fullName;
    const pathDetails = parseFirebaseGenePath(path);
    if (pathDetails === undefined) {
      return Promise.reject(new Error('Cannot parse firebase gene path'));
    }
    const hugoSymbol = pathDetails.hugoSymbol;
    const pathFromGene = pathDetails.pathFromGene;

    // Check if section can be removed immediately
    const removeWithoutReview = isSectionRemovableWithoutReview(review);

    review = new Review(name, undefined, undefined, true);
    if (isDemotedToVus) {
      review.demotedToVus = true;
    }

    if (removeWithoutReview) {
      const { firebaseArrayPath, deleteIndex } = extractArrayPath(path);
      const nestedUuids = findNestedUuids(sectionObject);
      try {
        await this.firebaseRepository.deleteFromArray(firebaseArrayPath, [deleteIndex]);
        for (const id of nestedUuids) {
          await this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, id, false, isGermline);
        }
      } catch (error) {
        throw new SentryError('Failed to delete without review', { path, sectionObject, review, uuid, isDemotedToVus });
      }
    } else {
      // Let the deletion be reviewed
      try {
        await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), { [`${pathFromGene}_review`]: review });
        await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, true, isGermline);
      } catch (error) {
        throw new SentryError('Failed to mark deletion for review', { path, sectionObject, review, uuid, isDemotedToVus });
      }
    }
  };

  createGene = async (hugoSymbol: string, isGermline: boolean, routeAfter?: string) => {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const results = await Promise.all([
      isPromiseOk(this.firebaseRepository.create(genePath, new Gene(hugoSymbol))),
      isPromiseOk(this.firebaseMetaService.createMetaGene(hugoSymbol, isGermline)),
    ]);

    if (results[0].ok && results[1].ok) {
      // both succeeded
      if (routeAfter) {
        window.location.href = routeAfter;
      }
    } else if (results[0].ok && !results[1].ok) {
      // createMetaGene failed
      notifyError(results[1].error);
      this.deleteObject(genePath);
    } else if (results[1].ok && !results[0].ok) {
      // createGene failed
      notifyError(results[0].error);
      this.firebaseMetaService.deleteMetaGene(hugoSymbol, isGermline);
    } else {
      // both failed
      notifyError(new Error(`Errors: ${getErrorMessage(results[0].error)}, ${getErrorMessage(results[1].error)}`));
    }
  };

  addTumor = async (tumorPath: string, newTumor: Tumor, isGermline: boolean) => {
    const { hugoSymbol } = parseFirebaseGenePath(tumorPath);
    const name = this.authStore.fullName;
    newTumor.cancerTypes_review = new Review(name, undefined, true, undefined);

    const tumorNameUuid = `${newTumor.cancerTypes_uuid}, ${newTumor.excludedCancerTypes_uuid}`;

    return this.firebaseRepository.pushToArray(tumorPath, [newTumor]).then(() => {
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, tumorNameUuid, true, isGermline);
    });
  };

  updateTumorName = async (
    tumorPath: string,
    currentCancerTypes: CancerType[],
    currentExcludedCancerTypes: CancerType[],
    tumor: Tumor,
    isGermline: boolean,
  ) => {
    const cancerTypesReview = getUpdatedReview(tumor.cancerTypes_review, currentCancerTypes, tumor.cancerTypes, this.authStore.fullName);
    const excludedCancerTypesReview = getUpdatedReview(
      tumor.excludedCancerTypes_review,
      currentExcludedCancerTypes,
      tumor.excludedCancerTypes,
      this.authStore.fullName,
    );

    tumor.cancerTypes_review = cancerTypesReview.updatedReview;
    tumor.excludedCancerTypes_review = excludedCancerTypesReview.updatedReview;

    const isChangeReverted = cancerTypesReview.isChangeReverted || excludedCancerTypesReview.isChangeReverted;
    // The legacy platform combines the uuid of cancerTypes and excludedCancerTypes in review mode.
    // To maintain compatibility, we will do the same here.
    const tumorNameUuid = `${tumor.cancerTypes_uuid}, ${tumor.excludedCancerTypes_uuid}`;

    const { hugoSymbol } = parseFirebaseGenePath(tumorPath);

    return this.firebaseRepository.update(tumorPath, tumor).then(() => {
      if (cancerTypesReview.isChangeReverted) {
        this.firebaseRepository.delete(`${tumorPath}/cancerTypes_review/lastReviewed`);
      }
      if (excludedCancerTypesReview.isChangeReverted) {
        this.firebaseRepository.delete(`${tumorPath}/excludedCancerTypes_review/lastReviewed`);
      }
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, tumorNameUuid, !isChangeReverted, isGermline);
    });
  };

  updateTreatmentName = async (treatmentPath: string, currentTreatmentName: string, treatment: Treatment, isGermline: boolean) => {
    return this.firebaseRepository.update(treatmentPath, treatment).then(() => {
      this.firebaseGeneReviewService.updateReviewableContent(
        `${treatmentPath}/name`,
        currentTreatmentName,
        treatment.name,
        treatment.name_review,
        treatment.name_uuid,
      );
    });
  };

  addTreatment = async (treatmentPath: string, newTreatment: Treatment, isGermline: boolean) => {
    const { hugoSymbol } = parseFirebaseGenePath(treatmentPath);
    const name = this.authStore.fullName;
    newTreatment.name_review = new Review(name, undefined, true, undefined);

    return this.firebaseRepository.pushToArray(treatmentPath, [newTreatment]).then(() => {
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, newTreatment.name_uuid, true, isGermline);
    });
  };

  updateMutationName = async (mutationPath: string, allMutationsPath: string, currentMutationName: string, mutation: Mutation) => {
    await this.firebaseRepository.update(mutationPath, mutation).then(() => {
      this.firebaseGeneReviewService.updateReviewableContent(
        `${mutationPath}/name`,
        currentMutationName,
        mutation.name,
        mutation.name_review,
        mutation.name_uuid,
      );
    });

    await this.firebaseMutationConvertIconStore.fetchData(allMutationsPath);
  };

  addMutation = async (
    mutationsPath: string,
    newMutation: Mutation,
    isGermline: boolean,
    isPromotedToMutation = false,
    mutationEffectDescription?: string,
  ) => {
    const { hugoSymbol } = parseFirebaseGenePath(mutationsPath);
    const name = this.authStore.fullName;
    newMutation.name_review = new Review(name, undefined, true, undefined);
    if (isPromotedToMutation) {
      newMutation.name_review.promotedToMutation = true;
    }
    if (mutationEffectDescription) {
      newMutation.mutation_effect.description = mutationEffectDescription;
      newMutation.mutation_effect.description_review = new Review(name, '');
    }

    await this.firebaseRepository.pushToArray(mutationsPath, [newMutation]).then(() => {
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, false);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, newMutation.name_uuid, true, isGermline);
      if (mutationEffectDescription) {
        this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, newMutation.mutation_effect.description_uuid, true, isGermline);
      }
    });

    await this.firebaseMutationConvertIconStore.fetchData(mutationsPath);
  };

  updateRelevantCancerTypes = async (
    rctPath: string,
    currentRelevantCancerTypes: CancerType[],
    newRelevantCancerTypes: CancerType[],
    review: Review,
    uuid: string,
    isGermline,
    initialUpdate?: boolean,
  ) => {
    const { hugoSymbol } = parseFirebaseGenePath(rctPath);
    if (initialUpdate) {
      return this.firebaseRepository.create(rctPath, newRelevantCancerTypes).then(() => {
        this.firebaseRepository.update(`${rctPath}_review`, new Review(this.authStore.fullName, undefined, undefined, undefined, true));
        this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
        this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, true, isGermline);
      });
    }
    return this.firebaseRepository.create(rctPath, newRelevantCancerTypes).then(() => {
      this.firebaseGeneReviewService.updateReviewableContent(
        rctPath,
        currentRelevantCancerTypes || [],
        newRelevantCancerTypes,
        review,
        uuid,
      );
    });
  };

  addEmptyGenomicIndicator = async (genomicIndicatorsPath: string) => {
    await this.addGenomicIndicator(false, genomicIndicatorsPath, '');
  };

  addGenomicIndicator = async (
    toReview: boolean,
    genomicIndicatorsPath: string,
    name: string,
    description?: string,
    alleleStates?: ALLELE_STATE[],
  ) => {
    const genePath = parseFirebaseGenePath(genomicIndicatorsPath);
    const newGenomicIndicator = new GenomicIndicator();
    const uuidsToReview = [];

    newGenomicIndicator.associationVariants = [{ name: PATHOGENIC_VARIANTS, uuid: PATHOGENIC_VARIANTS }];

    const newReview = new Review(this.authStore.fullName);
    newReview.updateTime = new Date().getTime();

    newGenomicIndicator.name = name;
    if (toReview) {
      newGenomicIndicator.name_review = _.cloneDeep(newReview);
      newGenomicIndicator.name_review.added = true;
      uuidsToReview.push(newGenomicIndicator.name_uuid);
    }
    if (description) {
      newGenomicIndicator.description = description;
      if (toReview) {
        newGenomicIndicator.description_review = newReview;
        uuidsToReview.push(newGenomicIndicator.description_uuid);
      }
    }

    if (alleleStates) {
      alleleStates.forEach(alleleState => {
        const asKey = alleleState.toLowerCase();
        newGenomicIndicator.allele_state[asKey] = alleleState;
        if (toReview) {
          newGenomicIndicator.allele_state[`${asKey}_review`] = newReview;
          uuidsToReview.push(newGenomicIndicator.allele_state[`${asKey}_uuid`]);
        }
      });
    }

    await this.firebaseRepository.pushToArray(genomicIndicatorsPath, [newGenomicIndicator]).then(() => {
      if (toReview) {
        this.firebaseMetaService.updateGeneMetaContent(genePath.hugoSymbol, true);
        uuidsToReview.forEach(uuid => {
          this.firebaseMetaService.updateGeneReviewUuid(genePath.hugoSymbol, uuid, true, true);
        });
      }
    });
  };

  getObject = async (path: string) => {
    return await this.firebaseRepository.get(path);
  };

  deleteObject = async (path: string) => {
    await this.firebaseRepository.delete(path);
  };

  pushObjectsToArray = async (path: string, objects: any[]) => {
    await this.firebaseRepository.pushToArray(path, objects);
  };

  deleteObjectsFromArray = async (path: string, indices: number[]) => {
    await this.firebaseRepository.deleteFromArray(path, indices);
  };

  updateObject = async (path: string, value: any) => {
    await this.firebaseRepository.update(path, value);
  };

  saveAllGenes = async (isGermlineProp: boolean) => {
    const drugLookup = (await this.firebaseRepository.get(FB_COLLECTION.DRUGS)).val() as Record<string, Drug>;
    const geneLookup =
      ((await this.firebaseRepository.get(isGermlineProp ? FB_COLLECTION.GERMLINE_GENES : FB_COLLECTION.GENES)).val() as Record<
        string,
        Gene
      >) ?? {};
    const vusLookup =
      ((await this.firebaseRepository.get(isGermlineProp ? FB_COLLECTION.GERMLINE_VUS : FB_COLLECTION.VUS)).val() as Record<
        string,
        Record<string, Vus>
      >) ?? {};
    for (const [hugoSymbol, gene] of Object.entries(geneLookup)) {
      const maybeVus: Record<string, Vus> | null = vusLookup[hugoSymbol];
      const args: Parameters<typeof getDriveAnnotations>[1] = {
        gene,
        vus: maybeVus == null ? undefined : Object.values(maybeVus),
      };
      const driveAnnotation = getDriveAnnotations(drugLookup, args);
      await this.driveAnnotationApi.submitDriveAnnotations(driveAnnotation);
    }
  };

  saveGene = async (isGermlineProp: boolean, hugoSymbolProp: string) => {
    const drugLookup = (await this.firebaseRepository.get(FB_COLLECTION.DRUGS)).val() as Record<string, Drug>;
    const maybeGene = (await this.firebaseRepository.get(getFirebaseGenePath(isGermlineProp, hugoSymbolProp))).val() as Gene | null;
    const maybeVus = (await this.firebaseRepository.get(getFirebaseVusPath(isGermlineProp, hugoSymbolProp))).val() as Record<
      string,
      Vus
    > | null;
    const args: Parameters<typeof getDriveAnnotations>[1] = {
      gene: maybeGene == null ? undefined : maybeGene,
      vus: maybeVus == null ? undefined : Object.values(maybeVus),
    };
    const driveAnnotation = getDriveAnnotations(drugLookup, args);
    await this.driveAnnotationApi.submitDriveAnnotations(driveAnnotation);
  };
}
