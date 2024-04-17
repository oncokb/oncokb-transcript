import {
  READABLE_FIELD,
  ReviewAction,
  ReviewActionToHistoryOperationMapping,
  ReviewLevelType,
  TI_TYPE_TO_HISTORY_STRING,
} from 'app/config/constants/firebase';
import { IDrug } from 'app/shared/model/drug.model';
import { History, HistoryList, HistoryOperationType, HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import { getCancerTypesNameWithExclusion, isUuid } from '../utils';
import { BaseReviewLevel, ReviewLevel } from './firebase-review-utils';
import { getMutationName, getTxName } from './firebase-utils';

export const buildHistoryFromReviews = (reviewerName: string, reviewLevels: ReviewLevel[]) => {
  const history = new History(reviewerName);
  for (const reviewLevel of reviewLevels) {
    if (reviewLevel.isUnderCreationOrDeletion) {
      continue;
    }
    const historyOperation = ReviewActionToHistoryOperationMapping[reviewLevel.reviewAction];

    const historyRecord: HistoryRecord = {
      lastEditBy: reviewLevel.review.updatedBy,
      location: reviewLevel.historyLocationString,
      operation: historyOperation,
      uuids: getUuidsFromReview(reviewLevel)?.join(','),
    };
    if (reviewLevel.newState !== undefined) {
      historyRecord.new = reviewLevel.newState;
    }
    if (reviewLevel.oldState !== undefined) {
      historyRecord.old = reviewLevel.oldState;
    }

    if (historyOperation === HistoryOperationType.DELETE) {
      // DELETIONs do not have uuid fields
      delete historyRecord.uuids;
    }
    if (historyOperation === HistoryOperationType.ADD) {
      delete historyRecord.old;
    }

    history.records.push(historyRecord);
  }
  return history;
};

export const getUuidsFromReview = (reviewLevel: ReviewLevel) => {
  const updatedFieldUuids = []; // Only the fields where data change has occurred should have its uuids added
  switch (reviewLevel.reviewAction) {
    case ReviewAction.CREATE:
      findAllUuidsFromReview(reviewLevel, updatedFieldUuids);
      break;
    case ReviewAction.DELETE:
      return undefined;
    default:
      updatedFieldUuids.push(reviewLevel.uuid);
  }
  return updatedFieldUuids;
};

const findAllUuidsFromReview = (baseReviewLevel: BaseReviewLevel, uuids: string[]) => {
  if (baseReviewLevel.reviewLevelType !== ReviewLevelType.REVIEWABLE) {
    return;
  }
  const reviewLevel = baseReviewLevel as ReviewLevel;
  uuids.push(reviewLevel.uuid);
  if (!reviewLevel.hasChildren()) {
    return;
  }
  for (const childReview of Object.values(reviewLevel.children)) {
    findAllUuidsFromReview(childReview, uuids);
  }
};

export type FlattenedHistory = HistoryRecord & Omit<History, 'records'>;

export const parseHistory = (history: HistoryList, drugList: readonly IDrug[]) => {
  const parsedHistory: FlattenedHistory[] = []; // ADD TYPE
  for (const historyEntry of Object.values(history)) {
    if (Symbol.iterator in historyEntry.records) {
      const parsedRecords: HistoryRecord[] = [];

      for (const record of historyEntry.records) {
        switch (record.operation) {
          case HistoryOperationType.ADD:
            parsedRecords.push(...parseAddRecord(record, drugList, true));
            break;
          case HistoryOperationType.DELETE:
            parsedRecords.push(...parseDeleteRecord(record, drugList));
            break;
          case HistoryOperationType.UPDATE:
            parsedRecords.push(...parseUpdateRecord(record, drugList));
            break;
          case HistoryOperationType.NAME_CHANGE:
            parsedRecords.push(...parseNameChangeRecord(record, drugList));
            break;
          case HistoryOperationType.DEMOTE_MUTATION:
            parsedRecords.push(...parseDeleteRecord(record, drugList));
            break;
          case HistoryOperationType.PROMOTE_VUS:
            parsedRecords.push(...parseAddRecord(record, drugList, true));
            break;
          default:
        }
      }

      const admin = historyEntry.admin;
      const timeStamp = historyEntry.timeStamp;
      parsedHistory.push(...parsedRecords.map(record => ({ ...record, admin, timeStamp })));
    }
  }

  return parsedHistory;
};

export const parseAddRecord = (record: HistoryRecord, drugList: readonly IDrug[], duplicateNestedUpdates: boolean) => {
  const parsedRecords: HistoryRecord[] = []; // ADD TYPE

  if (typeof record.new === 'string') {
    parsedRecords.push(record);
  } else if (typeof record.new === 'object') {
    const readableLocation = makeLocationReadable(
      record.location.split(',').map(key => key.trim()),
      drugList
    ).join(', ');
    parsedRecords.push({ ...record, location: readableLocation, new: JSON.stringify(record.new, null, 4) });

    if (duplicateNestedUpdates) {
      const updatedEntries = findEntriesInObjectByUuids(record.new, record.uuids?.split(',') || [], drugList).filter(
        entry => entry[0] !== READABLE_FIELD.NAME
      );

      for (const entry of updatedEntries) {
        parsedRecords.push({
          new: entry[1],
          operation: HistoryOperationType.UPDATE,
          lastEditBy: record.lastEditBy,
          location: `${readableLocation}, ${entry[0]}`,
        });
      }
    }
  }

  return parsedRecords;
};

export const parseDeleteRecord = (record: HistoryRecord, drugList: readonly IDrug[]): HistoryRecord[] => {
  const readableLocation = makeLocationReadable(
    record.location.split(',').map(key => key.trim()),
    drugList
  ).join(', ');
  return [{ ...record, location: readableLocation }];
};

export const parseUpdateRecord = (record: HistoryRecord, drugList: readonly IDrug[]) => {
  const parsedRecords: HistoryRecord[] = [];

  if (typeof record.new === 'string') {
    const readableLocation = makeLocationReadable(
      record.location.split(',').map(key => key.trim()),
      drugList
    ).join(', ');
    parsedRecords.push({ ...record, location: readableLocation });
  } else if (typeof record.new === 'object') {
    const readableLocation = record.location.split(',').map(key => key.trim());

    const newEntries = record.new ? Object.entries(record.new) : [];
    const oldEntries = record.old ? Object.entries(record.old) : [];
    for (const [key, val] of newEntries) {
      const location = makeLocationReadable([...readableLocation, key], drugList).join(', ');

      parsedRecords.push({
        new: val,
        old: record.old?.[key],
        operation: HistoryOperationType.UPDATE,
        lastEditBy: record.lastEditBy,
        location,
      });
    }
    for (const [key, val] of oldEntries) {
      const location = makeLocationReadable([...readableLocation, key], drugList).join(', ');

      if (!record.new[key]) {
        parsedRecords.push({
          old: val,
          operation: HistoryOperationType.UPDATE,
          lastEditBy: record.lastEditBy,
          location,
        });
      }
    }
  }

  return parsedRecords;
};

export const parseNameChangeRecord = (record: HistoryRecord, drugList: readonly IDrug[]): HistoryRecord[] => {
  const readableLocation = makeLocationReadable(
    record.location.split(',').map(key => key.trim()),
    drugList
  ).join(', ');
  return [{ ...record, location: readableLocation }];
};

/**
 * Returns the object's entries corresponding to the given uuids in the same order as the uuids
 * @param object - The object to search
 * @param uuids - The list of uuids corresponding to entries to search for
 * @returns The entries (in the format [path, value]) corresponding to the uuids in the same order as the uuids as an array. If any entries cannot be retrieved, `undefined` will be in that field's slot
 */
export const findEntriesInObjectByUuids = (object: any, uuids: string[], drugList: readonly IDrug[]) => {
  const fieldValues: [string, unknown][] = Array(uuids.length);
  let numFound = 0;

  let nestedObjects = [{ object, locationFields: [] }];
  while (nestedObjects.length > 0) {
    const newNestedObjects = [];

    for (const nestedObject of nestedObjects) {
      const entries = Object.entries(nestedObject.object);

      for (const [key, value] of entries) {
        const index = uuids.indexOf(value as string);
        if (index !== -1) {
          const fieldName = key.replace('_uuid', '');
          fieldValues[index] = [
            makeLocationReadable([...nestedObject.locationFields, fieldName], drugList).join(', '),
            nestedObject.object[fieldName],
          ];

          if (++numFound === uuids.length) {
            return fieldValues;
          }
          continue;
        }

        if (typeof nestedObject.object[key] === 'object') {
          switch (key) {
            case 'mutations':
              for (const mutation of nestedObject.object[key]) {
                newNestedObjects.push({
                  object: mutation,
                  locationFields: [...nestedObject.locationFields, getMutationName(mutation.name, mutation.alterations)],
                });
              }
              break;
            case 'tumors':
              for (const cancerType of nestedObject.object[key]) {
                newNestedObjects.push({
                  object: cancerType,
                  locationFields: [
                    ...nestedObject.locationFields,
                    getCancerTypesNameWithExclusion(cancerType.cancerTypes, cancerType.excludedCancerTypes || [], true),
                  ],
                });
              }
              break;
            case 'TIs':
              for (const ti of nestedObject.object[key]) {
                newNestedObjects.push({ object: ti, locationFields: nestedObject.locationFields });
              }
              break;
            case 'treatments':
              for (const treatment of nestedObject.object[key]) {
                newNestedObjects.push({ object: treatment, locationFields: [...nestedObject.locationFields, treatment.name] });
              }
              break;
            default:
              newNestedObjects.push({ object: nestedObject.object[key], locationFields: [...nestedObject.locationFields, key] });
          }
        }
      }
    }

    nestedObjects = newNestedObjects;
  }

  return fieldValues;
};

function makeLocationReadable(locationParts: string[], drugList: readonly IDrug[]) {
  // Hard code more in. Remove default case?, change name so that function is also used for old locations
  return makeFirebaseKeysReadable(makeHistoryLocationReadable(locationParts, drugList));
}

function makeFirebaseKeysReadable(keys: string[]) {
  // Hard code more in. Remove default case?
  const readableKeys: string[] = [];
  for (const key of keys) {
    switch (key) {
      case 'effect':
        break;
      case 'mutation_effect':
        readableKeys.push(READABLE_FIELD.MUTATION_EFFECT);
        break;
      case 'name':
      case 'cancerTypes':
        readableKeys.push(READABLE_FIELD.NAME);
        break;
      case 'inheritanceMechanism':
        readableKeys.push(READABLE_FIELD.INHERITANCE_MECHANISM);
        break;
      case 'description':
        readableKeys.push(READABLE_FIELD.DESCRIPTION);
        break;
      case 'summary':
        readableKeys.push(READABLE_FIELD.SUMMARY);
        break;
      case 'pathogenic':
        readableKeys.push(READABLE_FIELD.PATHOGENIC);
        break;
      case 'penetrance':
        readableKeys.push(READABLE_FIELD.PENETRANCE);
        break;
      case 'oncogenic':
        readableKeys.push(READABLE_FIELD.ONCOGENIC);
        break;
      case 'short':
        readableKeys.push(READABLE_FIELD.ADDITIONAL_INFORMATION);
        break;
      case 'fdaLevel':
        readableKeys.push(READABLE_FIELD.FDA_LEVEL);
        break;
      case 'indication':
        readableKeys.push(READABLE_FIELD.INDICATION);
        break;
      case 'propagation':
        readableKeys.push(READABLE_FIELD.PROPAGATION);
        break;
      default:
        readableKeys.push(key);
    }
  }
  return readableKeys;
}

function makeHistoryLocationReadable(locationParts: string[], drugList: readonly IDrug[]) {
  const readableKeys: string[] = [];
  for (const part of locationParts) {
    if (Object.values(TI_TYPE_TO_HISTORY_STRING).includes(part)) {
      continue;
    } else {
      let therapy = part;
      const subparts = therapy.split('+');

      for (const subpart of subparts) {
        const trimmedSubpart = subpart.trim();

        if (isUuid(trimmedSubpart)) {
          therapy = therapy.replace(trimmedSubpart, getTxName(drugList, trimmedSubpart));
        }
      }

      if (part !== therapy) {
        readableKeys.push(therapy);
        continue;
      }
    }

    switch (part) {
      case 'Gene Summary':
      case 'Tumor Type Summary':
        readableKeys.push(READABLE_FIELD.SUMMARY);
        break;
      case 'Gene Background':
        readableKeys.push(READABLE_FIELD.BACKGROUND);
        break;
      default:
        readableKeys.push(part);
    }
  }
  return readableKeys;
}
