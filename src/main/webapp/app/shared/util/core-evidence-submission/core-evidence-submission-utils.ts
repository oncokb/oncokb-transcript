import { DX_LEVELS, FDA_LEVELS, Mutation, PX_LEVELS, TI, TX_LEVELS, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { ImplicationLevelOfEvidenceEnum } from '../../api/generated/core/api';

export const LEVEL_MAPPING: Record<TX_LEVELS | DX_LEVELS | PX_LEVELS | '', ImplicationLevelOfEvidenceEnum> = {
  '': 'NO',
  '1': 'LEVEL_1',
  '2': 'LEVEL_2',
  '3A': 'LEVEL_3A',
  '3B': 'LEVEL_3B',
  '4': 'LEVEL_4',
  R1: 'LEVEL_R1',
  R2: 'LEVEL_R2',
  no: 'NO',
  Px1: 'LEVEL_Px1',
  Px2: 'LEVEL_Px2',
  Px3: 'LEVEL_Px3',
  Dx1: 'LEVEL_Dx1',
  Dx2: 'LEVEL_Dx2',
  Dx3: 'LEVEL_Dx3',
};
export const FDA_LEVEL_MAPPING: Record<FDA_LEVELS | '', ImplicationLevelOfEvidenceEnum> = {
  no: 'NO',
  Fda1: 'LEVEL_Fda1',
  Fda2: 'LEVEL_Fda2',
  Fda3: 'LEVEL_Fda3',
  '': 'NO',
};

export function mostRecentItem(reviewObjs: string | any[], include?: boolean) {
  let mostRecent = -1;
  for (let i = 0; i < reviewObjs.length; i++) {
    if (!include) {
      // This is designed to handle the reviewObj with systematically set updatetime
      // when 'include' equals true, it will use all reviewObj in the list
      // otherwise, we will only use the reviewObj with updatedBy info.
      if (!reviewObjs[i] || !reviewObjs[i].updatedBy) continue;
    }
    let currentItemTime: number | Date;
    if (reviewObjs[i] && reviewObjs[i].updateTime) {
      currentItemTime = new Date(reviewObjs[i].updateTime);
    }
    // we only continue to check if current item time is valid
    if (currentItemTime instanceof Date && !isNaN(currentItemTime.getTime())) {
      if (mostRecent < 0) {
        mostRecent = i;
      } else {
        // reset mostRect time when current item time is closer
        const mostRecentTime = new Date(reviewObjs[mostRecent].updateTime);
        if (mostRecentTime < currentItemTime) {
          mostRecent = i;
        }
      }
    }
  }
  if (mostRecent < 0) {
    return 0;
  }
  return mostRecent;
}

export function validateTimeFormat(updateTime: string | number | Date): any {
  let tempTime = new Date(updateTime);
  if (tempTime instanceof Date && !isNaN(tempTime.getTime())) {
    updateTime = tempTime.getTime();
  } else {
    // handle the case of time stamp in string format
    tempTime = new Date(Number(updateTime));
    if (tempTime instanceof Date && !isNaN(tempTime.getTime())) {
      updateTime = tempTime.getTime();
    } else {
      updateTime = new Date().getTime();
    }
  }
  return updateTime.toString();
}

export function getNewPriorities(list: Treatment[], unapprovedUuids: string | string[]) {
  const priorities: Record<string, Record<string, number>> = {};
  let count = 1;

  if (!_.isArray(unapprovedUuids)) {
    unapprovedUuids = [];
  }
  _.each(list, function (treatmentSec, __) {
    const name =
      treatmentSec.name_review && treatmentSec.name_review.lastReviewed ? treatmentSec.name_review.lastReviewed : treatmentSec.name;
    const uuid = treatmentSec.name_uuid;
    let notNewlyAdded = true;
    if (treatmentSec.name_review && treatmentSec.name_review.added) {
      notNewlyAdded = false;
    }
    if (_.isString(name) && (notNewlyAdded || unapprovedUuids.indexOf(uuid) !== -1)) {
      priorities[uuid] = {};
      _.each(name.split(','), function (t) {
        const treatment = t.trim();
        priorities[uuid][treatment] = count;
        count++;
      });
    }
  });
  return priorities;
}

type CollectUUIDsArgs = (
  | {
      type: 'mutation';
      obj: Mutation;
    }
  | {
      type: 'tumor';
      obj: Tumor;
    }
  | {
      type: 'TI';
      obj: TI;
    }
  | {
      type: 'treatment';
      obj: Treatment;
    }
) & {
  uuids?: string[];
  uuidType?: 'insideOnly' | 'evidenceOnly' | 'sectionOnly';
};

/**
 * Collects UUIDs from a given object based on its type and specified UUID type.
 *
 * @param {CollectUUIDsArgs} args - The arguments for the function.
 * @param {'mutation'|'tumor'|'TI'|'treatment'} args.type - The type of the object.
 * @param {Mutation|Tumor|TI|Treatment} args.obj - The object to collect UUIDs from.
 * @param {string[]} [args.uuids=[]] - The array to collect UUIDs into.
 * @param {'insideOnly'|'evidenceOnly'|'sectionOnly'} [args.uuidType] - The type of UUIDs to collect.
 * @returns {string[]} The array of collected UUIDs.
 */
export function collectUUIDs({ type, obj, uuids = [], uuidType }: CollectUUIDsArgs): string[] {
  if (type === 'mutation') {
    switch (uuidType) {
      case 'insideOnly':
        uuids.push(obj.mutation_effect.oncogenic_uuid);
        uuids.push(obj.mutation_effect.effect_uuid);
        uuids.push(obj.mutation_effect.description_uuid);
        break;
      case 'evidenceOnly':
        uuids.push(obj.mutation_effect.oncogenic_uuid);
        uuids.push(obj.mutation_effect.effect_uuid);
        break;
      case 'sectionOnly':
        uuids.push(obj.name_uuid);
        uuids.push(obj.mutation_effect_uuid);
        break;
      default:
        uuids.push(obj.name_uuid);
        uuids.push(obj.mutation_effect_uuid);
        uuids.push(obj.mutation_effect.oncogenic_uuid);
        uuids.push(obj.mutation_effect.effect_uuid);
        uuids.push(obj.mutation_effect.description_uuid);
        break;
    }
    _.each(obj.tumors, function (tumor) {
      collectUUIDs({ type: 'tumor', obj: tumor, uuids, uuidType });
    });
  } else if (type === 'tumor') {
    switch (uuidType) {
      case 'insideOnly':
        uuids.push(obj.summary_uuid);
        uuids.push(obj.prognosticSummary_uuid);
        uuids.push(obj.diagnosticSummary_uuid);
        uuids.push(obj.prognostic.level_uuid);
        uuids.push(obj.prognostic.description_uuid);
        uuids.push(obj.prognostic.excludedRCTs_uuid);
        uuids.push(obj.diagnostic.level_uuid);
        uuids.push(obj.diagnostic.description_uuid);
        uuids.push(obj.diagnostic.excludedRCTs_uuid);
        break;
      case 'evidenceOnly':
        uuids.push(obj.summary_uuid);
        uuids.push(obj.prognosticSummary_uuid);
        uuids.push(obj.diagnosticSummary_uuid);
        uuids.push(obj.prognostic_uuid);
        uuids.push(obj.diagnostic_uuid);
        break;
      case 'sectionOnly':
        uuids.push(getTumorUuids(obj));
        uuids.push(obj.prognostic_uuid);
        uuids.push(obj.diagnostic_uuid);
        break;
      default:
        uuids.push(getTumorUuids(obj));
        uuids.push(obj.summary_uuid);
        uuids.push(obj.prognosticSummary_uuid);
        uuids.push(obj.diagnosticSummary_uuid);
        uuids.push(obj.prognostic.level_uuid);
        uuids.push(obj.prognostic.description_uuid);
        uuids.push(obj.prognostic.excludedRCTs_uuid);
        uuids.push(obj.diagnostic.level_uuid);
        uuids.push(obj.diagnostic.description_uuid);
        uuids.push(obj.diagnostic.excludedRCTs_uuid);
        break;
    }
    _.each(obj.TIs, function (ti) {
      collectUUIDs({ type: 'TI', obj: ti, uuids, uuidType });
    });
  } else if (type === 'TI') {
    switch (uuidType) {
      case 'insideOnly':
      case 'evidenceOnly':
        break;
      case 'sectionOnly':
        uuids.push(obj.name_uuid);
        break;
      default:
        uuids.push(obj.name_uuid);
        break;
    }
    _.each(obj.treatments, function (treatment) {
      collectUUIDs({ type: 'treatment', obj: treatment, uuids, uuidType });
    });
  } else if (type === 'treatment') {
    switch (uuidType) {
      case 'insideOnly':
        uuids.push(obj.level_uuid);
        uuids.push(obj.fdaLevel_uuid);
        uuids.push(obj.propagation_uuid);
        uuids.push(obj.propagationLiquid_uuid);
        uuids.push(obj.indication_uuid);
        uuids.push(obj.description_uuid);
        break;
      case 'evidenceOnly':
        uuids.push(obj.name_uuid);
        break;
      case 'sectionOnly':
        uuids.push(obj.name_uuid);
        break;
      default:
        uuids.push(obj.name_uuid);
        uuids.push(obj.level_uuid);
        uuids.push(obj.fdaLevel_uuid);
        uuids.push(obj.propagation_uuid);
        uuids.push(obj.propagationLiquid_uuid);
        uuids.push(obj.indication_uuid);
        uuids.push(obj.description_uuid);
        break;
    }
  }
  return uuids;
}

function getTumorUuids(tumor: Tumor) {
  const uuids: string[] = [];
  if (tumor.cancerTypes_uuid) {
    uuids.push(tumor.cancerTypes_uuid);
  }
  if (tumor.excludedCancerTypes_uuid) {
    uuids.push(tumor.excludedCancerTypes_uuid);
  }
  return uuids.join(',');
}
