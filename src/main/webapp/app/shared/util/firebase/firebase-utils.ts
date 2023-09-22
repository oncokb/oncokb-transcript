import { FB_COLLECTION_PATH, UUID_REGEX } from 'app/config/constants';
import { Drug, Meta, Mutation } from 'app/shared/model/firebase/firebase.model';
import { replaceUrlParams } from '../url-utils';

/* Convert a nested object into an object where the key is the path to the object.
  Example:
    {type: {ocg: 'Oncogene}, name: 'ABL1' }
    is converted to
    {'type/ocg': 'Oncogene', 'name': 'ABL1'}
*/
export const convertNestedObject = (obj: any, key = '', result = {}) => {
  if (typeof obj !== 'object') {
    result[key] = obj;
    return result;
  }
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const newKey = key ? key + '/' + keys[i] : keys[i];
    convertNestedObject(obj[keys[i]], newKey, result);
  }

  return result;
};

export const getValueByNestedKey = (obj: any, nestedKey = '') => {
  return nestedKey.split('/').reduce((currObj, currKey) => {
    if (currObj) return currObj[currKey];
  }, obj);
};

export const getMutationName = (mutation: Mutation) => {
  const defaultNoName = '(No Name)';
  if (mutation.alteration) {
    if (mutation.alteration.proteinChange) {
      let name = mutation.alteration.proteinChange;
      if (mutation.alteration.cDna) {
        name += ` (${mutation.alteration.cDna})`;
      }
      return name;
    } else if (mutation.alteration.cDna) {
      return mutation.alteration.cDna;
    }
    // continue execution, check other data fields
  }
  if (mutation.name) {
    return mutation.name;
  } else {
    return defaultNoName;
  }
};

export const getTxName = (drugList: { [key: string]: Drug }, txUuidName: string) => {
  return txUuidName
    .split(',')
    .map(tx => {
      return tx
        .split('+')
        .map(drug => {
          drug = drug.trim();
          return drugList[drug] ? drugList[drug].drugName : drug;
        })
        .join(' + ');
    })
    .join(', ');
};

export const geneNeedsReview = (meta: Meta | undefined) => {
  let needsReview = false;
  const metaReview = meta?.review;
  if (metaReview) {
    needsReview = !!Object.keys(metaReview).find(key => UUID_REGEX.test(key));
  }
  return needsReview;
};

export const getFirebasePath = (type: keyof typeof FB_COLLECTION_PATH, ...params: string[]) => {
  return replaceUrlParams(FB_COLLECTION_PATH[type], ...params);
};
