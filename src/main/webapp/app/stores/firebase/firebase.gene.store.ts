import {
  DX_LEVELS,
  Gene,
  FIREBASE_ONCOGENICITY,
  PX_LEVELS,
  TX_LEVELS,
  Review,
  Tumor,
  Treatment,
  Mutation,
} from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from '../createStore';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { action, computed, makeObservable } from 'mobx';
import { ref, update } from 'firebase/database';
import { getValueByNestedKey, isSectionRemovableWithoutReview } from 'app/shared/util/firebase/firebase-utils';
import { parseFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { NestLevelType, RemovableNestLevel } from 'app/pages/curation/collapsible/NestLevel';

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
      updateTumor: action.bound,
      updateTreatment: action.bound,
      updateMutation: action.bound,
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
                  if (treatment.level !== TX_LEVELS.LEVEL_NO) {
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

  override updateReviewableContent(path: string, key: ExtractPathExpressions<Gene>, value: any) {
    try {
      return super.updateReviewableContent(path, key, value);
    } catch (error) {
      notifyError(error, `Could not update ${key} at location ${path}`);
    }
  }

  async deleteSection(nestLevel: RemovableNestLevel, path: string) {
    const name = this.rootStore.authStore.fullName;
    const pathDetails = parseFirebaseGenePath(path);
    if (pathDetails === undefined) {
      return Promise.reject(new Error('Cannot parse firebase gene path'));
    }
    const hugoSymbol = pathDetails.hugoSymbol;
    const pathFromGene = pathDetails.pathFromGene;

    // Check if section can be removed immediately
    const removeWithoutReview = isSectionRemovableWithoutReview(this.data, nestLevel, path);
    let key: string;
    let review: Review;

    if (nestLevel === NestLevelType.MUTATION || nestLevel === NestLevelType.THERAPY) {
      key = 'name';
      review = new Review(name, undefined, undefined, true);
    } else if (nestLevel === NestLevelType.CANCER_TYPE) {
      key = 'cancerTypes';
      review = new Review(name, undefined, undefined, true);
    }

    if (removeWithoutReview) {
      const pathParts = path.split('/');
      const indexToRemove = parseInt(pathParts.pop(), 10);
      const arrayPath = pathParts.join('/');
      return this.deleteFromArray(arrayPath, [indexToRemove]);
    }

    const uuid = getValueByNestedKey(this.data, `${pathFromGene}/${key}_uuid`);

    // Let the deletion be reviewed
    return update(ref(this.db, path), { [`${key}_review`]: review }).then(() => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, true);
    });
  }

  async updateTumor(path: string, tumor: Tumor) {
    return await update(ref(this.db, path), tumor);
  }

  async updateTreatment(path: string, treatment: Treatment) {
    return await update(ref(this.db, path), treatment);
  }

  async updateMutation(path: string, mutation: Mutation) {
    return await update(ref(this.db, path), mutation);
  }
}
