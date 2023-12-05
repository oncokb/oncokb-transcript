import { DX_LEVELS, Gene, FIREBASE_ONCOGENICITY, PX_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from '../createStore';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { computed, makeObservable } from 'mobx';

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
}
