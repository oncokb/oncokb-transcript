import { DX_LEVELS, Gene, FIREBASE_ONCOGENICITY, PX_LEVELS, TX_LEVELS, Review } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from '../createStore';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { action, computed, makeObservable } from 'mobx';
import { NestLevelType, RemoveableNestLevel } from 'app/pages/curation/collapsible/Collapsible';
import { ref, update } from '@firebase/database';
import { getValueByNestedKey } from 'app/shared/util/firebase/firebase-utils';

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
    };
  };
};

export class FirebaseGeneStore extends FirebaseReviewableCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      mutationSummaryStats: computed,
      deleteGeneSection: action.bound,
    });
  }

  get mutationSummaryStats() {
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
                  summary[mutation.name_uuid][tumor.cancerTypes_uuid].txLevels.push(treatment.level);
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

  override updateReviewableContent(path: string, key: ExtractPathExpressions<Gene>, value: any) {
    try {
      return super.updateReviewableContent(path, key, value);
    } catch (error) {
      notifyError(error, `Could not update ${key} at location ${path}`);
    }
  }

  isSectionRemoveableWithoutReview = (nestLevel: RemoveableNestLevel, sectionToRemovePath: string) => {
    let reviewKey;
    if (nestLevel === NestLevelType.MUTATION || nestLevel === NestLevelType.THERAPY) {
      reviewKey = 'name_review';
    } else {
      reviewKey = 'cancerTypes_review';
    }
    const review: Review = getValueByNestedKey(this.data, `${sectionToRemovePath}/${reviewKey}`);
    return !!review && !!review.added;
  };

  async deleteGeneSection(nestLevel: NestLevelType, path: string) {
    if (![NestLevelType.MUTATION, NestLevelType.CANCER_TYPE, NestLevelType.THERAPY].includes(nestLevel)) {
      return Promise.reject(new Error('Cannot delete an invalid section'));
    }

    const name = this.rootStore?.authStore?.fullName;
    if (!name) {
      return Promise.reject(new Error('Cannot update collaborator with undefined name'));
    }

    // Check if section can be removed immediately
    const pathFromGene = path.split('/').slice(2).join('/');
    let removeWithoutReview = false;
    let name_review: Review | undefined = undefined;
    let cancerTypes_review: Review | undefined = undefined;
    let reviewKey;

    if (nestLevel === NestLevelType.MUTATION || nestLevel === NestLevelType.THERAPY) {
      reviewKey = 'name';
      name_review = getValueByNestedKey(this.data, `${pathFromGene}/${reviewKey}_review`);
      removeWithoutReview = !!name_review && !!name_review.added;
      name_review = {
        updatedBy: name,
        updateTime: new Date().getTime(),
        removed: true,
      };
    } else if (nestLevel === NestLevelType.CANCER_TYPE) {
      reviewKey = 'cancerTypes';
      cancerTypes_review = getValueByNestedKey(this.data, `${pathFromGene}/${reviewKey}_review`);
      removeWithoutReview = !!cancerTypes_review && !!cancerTypes_review.added;
      cancerTypes_review = {
        updatedBy: name,
        updateTime: new Date().getTime(),
        removed: true,
      };
    }

    const hugoSymbol = path.split('/')[1];
    if (!hugoSymbol) {
      return Promise.reject(new Error('Cannot update when hugoSymbol is undefined'));
    }

    if (removeWithoutReview) {
      const pathParts = path.split('/');
      const indexToRemove = parseInt(pathParts.pop(), 10);
      const arrayPath = pathParts.join('/');
      return this.deleteFromArray(arrayPath, [indexToRemove]);
    }

    const uuid = getValueByNestedKey(this.data, `${pathFromGene}/${reviewKey}_uuid`);

    // Let the deletion be reviewed
    if (nestLevel === NestLevelType.MUTATION || nestLevel === NestLevelType.THERAPY) {
      return update(ref(this.db, path), { name_review }).then(() => {
        this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol);
        this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, true);
      });
    } else if (nestLevel === NestLevelType.CANCER_TYPE) {
      return update(ref(this.db, path), { cancerTypes_review }).then(() => {
        this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol);
        this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, true);
      });
    }
  }
}
