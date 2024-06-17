import {
  ALL_TI_TYPE_HISTORY_STRINGS,
  FIREBASE_KEY_TO_READABLE_FIELD,
  HISTORY_OPERATION_TO_PAST_TENSE,
  READABLE_FIELD,
  ReviewAction,
  ReviewActionToHistoryOperationMapping,
  ReviewLevelType,
} from 'app/config/constants/firebase';
import { IDrug } from 'app/shared/model/drug.model';
import { History, HistoryCollection, HistoryList, HistoryOperationType, HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { getCancerTypesNameWithExclusion, isUuid } from '../utils';
import { BaseReviewLevel, ReviewLevel } from './firebase-review-utils';
import { getMutationName, getTxName } from './firebase-utils';

export const buildHistoryFromReviews = (reviewerName: string, reviewLevels: ReviewLevel[]) => {
  const history = new History(reviewerName);
  for (const reviewLevel of reviewLevels) {
    const historyOperation = ReviewActionToHistoryOperationMapping[reviewLevel.reviewInfo.reviewAction];

    const historyRecord: HistoryRecord = {
      lastEditBy: reviewLevel.reviewInfo.review.updatedBy,
      location: reviewLevel.historyLocation,
      operation: historyOperation,
      uuids: getUuidsFromReview(reviewLevel)?.join(','),
    };
    if (reviewLevel.historyData.newState !== undefined) {
      historyRecord.new = reviewLevel.historyData.newState;
    }
    if (reviewLevel.historyData.oldState !== undefined) {
      historyRecord.old = reviewLevel.historyData.oldState;
    }

    if (historyOperation === HistoryOperationType.DELETE || historyOperation === HistoryOperationType.DEMOTE_MUTATION) {
      // DELETIONs do not have uuid fields
      delete historyRecord.uuids;
    }
    if (historyOperation === HistoryOperationType.ADD || historyOperation === HistoryOperationType.PROMOTE_VUS) {
      delete historyRecord.old;
    }

    history.records.push(historyRecord);
  }
  return history;
};

export const getUuidsFromReview = (reviewLevel: ReviewLevel) => {
  const updatedFieldUuids = []; // Only the fields where data change has occurred should have its uuids added
  switch (reviewLevel.reviewInfo.reviewAction) {
    case ReviewAction.CREATE:
    case ReviewAction.PROMOTE_VUS:
      findAllUuidsFromReview(reviewLevel, updatedFieldUuids);
      break;
    case ReviewAction.DELETE:
    case ReviewAction.DEMOTE_MUTATION:
      return undefined;
    default:
      updatedFieldUuids.push(reviewLevel.reviewInfo.uuid);
  }
  return updatedFieldUuids;
};

const findAllUuidsFromReview = (baseReviewLevel: BaseReviewLevel, uuids: string[]) => {
  if (baseReviewLevel.reviewLevelType !== ReviewLevelType.REVIEWABLE) {
    return;
  }
  const reviewLevel = baseReviewLevel as ReviewLevel;
  uuids.push(reviewLevel.reviewInfo.uuid);
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
    if (historyEntry.records && Symbol.iterator in historyEntry.records) {
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
      drugList,
    ).join(', ');
    parsedRecords.push({ ...record, location: readableLocation, new: JSON.stringify(record.new, null, 4) });

    if (duplicateNestedUpdates) {
      const updatedEntries = findEntriesInObjectByUuids(record.new, record.uuids?.split(',') || [], drugList).filter(
        entry => (entry[0] as READABLE_FIELD) !== READABLE_FIELD.NAME,
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
    drugList,
  ).join(', ');

  return [{ ...record, location: readableLocation, old: JSON.stringify(record.old) }];
};

export const parseUpdateRecord = (record: HistoryRecord, drugList: readonly IDrug[]) => {
  const parsedRecords: HistoryRecord[] = [];

  if (typeof record.new === 'string') {
    const readableLocation = makeLocationReadable(
      record.location.split(',').map(key => key.trim()),
      drugList,
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
    drugList,
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

          if ((makeLocationReadable([fieldName], drugList).join() as READABLE_FIELD) === READABLE_FIELD.ASSOCIATION_VARIANTS) {
            nestedObject.object[fieldName] = nestedObject.object[fieldName].map(variant => variant.name).join(', ');
          }

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

export function makeLocationReadable(locationParts: string[], drugList: readonly IDrug[]) {
  // Hard code more in. Remove default case?, change name so that function is also used for old locations
  return makeFirebaseKeysReadable(makeHistoryLocationReadable(locationParts, drugList));
}

export function makeFirebaseKeysReadable(keys: string[]) {
  const readableKeys: string[] = [];
  for (const key of keys) {
    const readableKey = FIREBASE_KEY_TO_READABLE_FIELD[key];
    if (readableKey) {
      readableKeys.push(readableKey);
    } else {
      readableKeys.push(key);
    }
  }
  return readableKeys;
}

export function makeHistoryLocationReadable(locationParts: string[], drugList: readonly IDrug[]) {
  const readableKeys: string[] = [];
  for (const part of locationParts) {
    if (ALL_TI_TYPE_HISTORY_STRINGS.includes(part)) {
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

export type DownloadableHistoryEntry = {
  location: string;
  operation: HistoryOperationType | '';
  timeStamp: number;
  hugoSymbol: string;
  old?: string;
  new?: string;
  level?: string; // only for treatment add or delete
};

export type DownloadableHistoryResult = {
  gene: DownloadableHistoryEntry[];
  alteration: DownloadableHistoryEntry[];
  evidence: DownloadableHistoryEntry[];
};

export function getHistoryEntryStrings(entries: DownloadableHistoryEntry[]) {
  const sortedEntries = _.sortBy(entries, 'hugoSymbol', 'timeStamp');

  const strings: string[] = [];
  for (const entry of sortedEntries) {
    if (!entry.new && !entry.old) {
      strings.push(
        `${entry.hugoSymbol} ${entry.location}${entry.level ? ' ' + entry.level : ''} ${HISTORY_OPERATION_TO_PAST_TENSE[entry.operation]}`,
      );
    } else if ((entry.new || entry.old) && entry.new !== entry.old) {
      const operationLine = `${entry.hugoSymbol} ${entry.location} ${HISTORY_OPERATION_TO_PAST_TENSE[entry.operation]}\n`;
      const newLine = `\t New: ${entry.new || ''}\n`;
      const oldLine = `\t Old: ${entry.old || ''}`;

      strings.push(operationLine + newLine + oldLine);
    }
  }
  return _.uniq(strings);
}

export function getAllGeneHistoryForDateRange(historyCollection: HistoryCollection, drugList: readonly IDrug[], start?: Date, end?: Date) {
  const result: DownloadableHistoryResult = {
    gene: [],
    alteration: [],
    evidence: [],
  };

  if (end && end < start) {
    return result;
  }

  for (const [hugoSymbol, history] of Object.entries(historyCollection)) {
    const geneHistory = getGeneHistoryForDateRange(hugoSymbol, history.api, drugList, start, end);
    result.gene.push(...geneHistory.gene);
    result.alteration.push(...geneHistory.alteration);
    result.evidence.push(...geneHistory.evidence);
  }

  return result;
}

export function isBetweenDates(date: Date, start?: Date, end?: Date) {
  if (start && end) {
    return date >= start && date <= end;
  } else if (start) {
    return date >= start;
  } else if (end) {
    return date <= end;
  } else {
    return true;
  }
}

export function getGeneHistoryForDateRange(
  hugoSymbol: string,
  historyList: HistoryList,
  drugList: readonly IDrug[],
  start?: Date,
  end?: Date,
) {
  const result: DownloadableHistoryResult = {
    gene: [],
    alteration: [],
    evidence: [],
  };

  if (end && end < start) {
    return result;
  }

  const geneFields = [
    READABLE_FIELD.GENE_TYPE,
    READABLE_FIELD.SUMMARY,
    READABLE_FIELD.BACKGROUND,
    READABLE_FIELD.PENETRANCE,
    READABLE_FIELD.INHERITANCE_MECHANISM,
  ];
  const alterationFields = [
    READABLE_FIELD.MUTATION_EFFECT,
    READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE,
    READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE,
  ];
  const showDiffFields = [READABLE_FIELD.ONCOGENIC, READABLE_FIELD.EFFECT, READABLE_FIELD.LEVEL];

  const filteredHistory = _.cloneDeep(historyList);
  for (const [uuid, historyEntry] of Object.entries(filteredHistory)) {
    if (!isBetweenDates(new Date(historyEntry.timeStamp), start, end)) {
      delete filteredHistory[uuid];
    }
  }

  const parsedHistory = parseHistory(filteredHistory, drugList);
  for (const record of parsedHistory) {
    if (!record.location) {
      continue;
    }

    const entry: DownloadableHistoryEntry = {
      location: record.location,
      operation: record.operation,
      hugoSymbol,
      timeStamp: record.timeStamp,
    };
    if (record.operation === HistoryOperationType.NAME_CHANGE || showDiffFields.some(field => record.location.endsWith(field))) {
      entry.new = record.new as string;
      entry.old = record.old as string;
    }

    let isAlteration = false;
    if (record.operation === HistoryOperationType.ADD) {
      // add
      const addedObject = JSON.parse(record.new as string);
      if (addedObject['mutation_effect']) {
        isAlteration = true;
      }

      if (addedObject['level']) {
        entry.level = addedObject.level;
      }
    } else if (record.operation === HistoryOperationType.DELETE && record.old) {
      const deletedObject = JSON.parse(record.old as string);
      if (deletedObject['mutation_effect']) {
        isAlteration = true;
      }

      if (deletedObject['level']) {
        entry.level = deletedObject.level;
      }
    } else if (record.operation === HistoryOperationType.NAME_CHANGE && record.location === record.new) {
      isAlteration = true;
    } else if (record.operation === HistoryOperationType.PROMOTE_VUS || record.operation === HistoryOperationType.DEMOTE_MUTATION) {
      isAlteration = true;
    } else if (alterationFields.some(field => record.location.includes(field))) {
      isAlteration = true;
    }

    if (geneFields.some(field => (record.location as READABLE_FIELD) === field)) {
      // gene
      result.gene.push(entry);
    } else if (isAlteration) {
      // alteration
      result.alteration.push(entry);
    } else {
      // evidence
      result.evidence.push(entry);
    }
  }
  return result;
}
