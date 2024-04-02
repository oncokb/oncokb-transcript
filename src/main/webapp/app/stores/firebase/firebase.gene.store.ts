import {
  CancerType,
  DX_LEVELS,
  FIREBASE_ONCOGENICITY,
  Gene,
  Mutation,
  PX_LEVELS,
  Review,
  TX_LEVELS,
  Treatment,
  Tumor,
} from 'app/shared/model/firebase/firebase.model';
import { isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
import { parseFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { getFirebaseGenePath, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { FirebaseReviewableCrudStore, getUpdatedReview } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ref, remove, set, update } from 'firebase/database';
import { action, computed, makeObservable } from 'mobx';
import { IRootStore } from '../createStore';
import _ from 'lodash';

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

export class FirebaseGeneStore extends FirebaseReviewableCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      hugoSymbol: computed,
      allLevelMutationSummaryStats: computed,
      mutationLevelMutationSummaryStats: computed,
      deleteSection: action.bound,
      addTumor: action.bound,
      updateTumorName: action.bound,
      addTreatment: action.bound,
      updateTreatmentName: action.bound,
      updateMutationName: action.bound,
      addMutation: action.bound,
      updateRelevantCancerTypes: action.bound,
    });
  }

  get hugoSymbol() {
    return this.data?.name;
  }

  get allLevelMutationSummaryStats() {
    const summary: AllLevelSummary = {};
    const mutations = this.data?.mutations;
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
  }

  get mutationLevelMutationSummaryStats() {
    const summary: MutationLevelSummary = {};
    const mutations = this.data?.mutations;
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
  }
  async deleteSection(path: string, review: Review, uuid: string, isDemotedToVus = false) {
    const isGermline = path.toLowerCase().includes('germline');
    const name = this.rootStore.authStore.fullName;
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
      const pathParts = path.split('/');
      const indexToRemove = parseInt(pathParts.pop(), 10);
      const arrayPath = pathParts.join('/');
      return this.deleteFromArray(arrayPath, [indexToRemove]);
    }

    // Let the deletion be reviewed
    return update(ref(this.db, `${getFirebaseGenePath(isGermline, hugoSymbol)}`), {
      [`${pathFromGene}_review`]: review,
    }).then(() => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, isGermline);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, true, isGermline);
    });
  }

  async addTumor(tumorPath: string, newTumor: Tumor) {
    const { hugoSymbol } = parseFirebaseGenePath(tumorPath);
    const name = this.rootStore.authStore.fullName;
    newTumor.cancerTypes_review = new Review(name, undefined, true, undefined);

    return this.pushToArray(tumorPath, [newTumor]).then(() => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, false);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, newTumor.cancerTypes_uuid, true, false);
    });
  }

  async updateTumorName(tumorPath: string, currentCancerTypes: CancerType[], currentExcludedCancerTypes: CancerType[], tumor: Tumor) {
    const cancerTypesReview = getUpdatedReview(
      tumor.cancerTypes_review,
      currentCancerTypes,
      tumor.cancerTypes,
      this.rootStore.authStore.fullName
    );
    const excludedCancerTypesReview = getUpdatedReview(
      tumor.excludedCancerTypes_review,
      currentExcludedCancerTypes,
      tumor.excludedCancerTypes,
      this.rootStore.authStore.fullName
    );

    tumor.cancerTypes_review = cancerTypesReview.updatedReview;
    tumor.excludedCancerTypes_review = excludedCancerTypesReview.updatedReview;

    const { hugoSymbol } = parseFirebaseGenePath(tumorPath);

    return update(ref(this.db, tumorPath), tumor).then(() => {
      if (cancerTypesReview.isChangeReverted) {
        remove(ref(this.db, `${tumorPath}/cancerTypes_review/lastReviewed`));
      }
      if (excludedCancerTypesReview.isChangeReverted) {
        remove(ref(this.db, `${tumorPath}/excludedCancerTypes_review/lastReviewed`));
      }
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, false);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, tumor.cancerTypes_uuid, !cancerTypesReview.isChangeReverted, false);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(
        hugoSymbol,
        tumor.excludedCancerTypes_uuid,
        !excludedCancerTypesReview.isChangeReverted,
        false
      );
    });
  }

  async updateTreatmentName(treatmentPath: string, currentTreatmentName: string, treatment: Treatment) {
    return update(ref(this.db, treatmentPath), treatment).then(() => {
      this.updateReviewableContent(
        `${treatmentPath}/name`,
        currentTreatmentName,
        treatment.name,
        treatment.name_review,
        treatment.name_uuid
      );
    });
  }

  async addTreatment(treatmentPath: string, newTreatment: Treatment) {
    const { hugoSymbol } = parseFirebaseGenePath(treatmentPath);
    const name = this.rootStore.authStore.fullName;
    newTreatment.name_review = new Review(name, undefined, true, undefined);

    return this.pushToArray(treatmentPath, [newTreatment]).then(() => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, false);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, newTreatment.name_uuid, true, false);
    });
  }

  async updateMutationName(mutationPath: string, currentMutationName: string, mutation: Mutation) {
    return update(ref(this.db, mutationPath), mutation).then(() => {
      this.updateReviewableContent(`${mutationPath}/name`, currentMutationName, mutation.name, mutation.name_review, mutation.name_uuid);
    });
  }

  async addMutation(mutationPath: string, newMutation: Mutation, isPromotedToMutation = false, mutationEffectDescription?: string) {
    const { hugoSymbol } = parseFirebaseGenePath(mutationPath);
    const name = this.rootStore.authStore.fullName;
    newMutation.name_review = new Review(name, undefined, true, undefined);
    if (isPromotedToMutation) {
      newMutation.name_review.promotedToMutation = true;
    }
    if (mutationEffectDescription) {
      newMutation.mutation_effect.description = mutationEffectDescription;
      newMutation.mutation_effect.description_review = new Review(name, '');
    }

    return this.pushToArray(mutationPath, [newMutation]).then(() => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, false);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, newMutation.name_uuid, true, false);
      if (mutationEffectDescription) {
        this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, newMutation.mutation_effect.description_uuid, true, false);
      }
    });
  }

  async updateRelevantCancerTypes(
    rctPath: string,
    currentRelevantCancerTypes: CancerType[],
    newRelevantCancerTypes: CancerType[],
    review: Review,
    uuid: string,
    initialUpdate?: boolean
  ) {
    const { hugoSymbol } = parseFirebaseGenePath(rctPath);
    if (initialUpdate) {
      return set(ref(this.db, rctPath), newRelevantCancerTypes).then(() => {
        update(ref(this.db, `${rctPath}_review`), new Review(this.rootStore.authStore.fullName, undefined, undefined, undefined, true));
        this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, false);
        this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, true, false);
      });
    }
    return set(ref(this.db, rctPath), newRelevantCancerTypes).then(() => {
      this.updateReviewableContent(rctPath, currentRelevantCancerTypes || [], newRelevantCancerTypes, review, uuid);
    });
  }
}
