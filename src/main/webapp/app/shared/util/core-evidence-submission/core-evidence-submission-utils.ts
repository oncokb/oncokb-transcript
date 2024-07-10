import { DX_LEVELS, FDA_LEVELS, PX_LEVELS, TX_LEVELS, Treatment } from 'app/shared/model/firebase/firebase.model';
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
