import { ReviewAction, ReviewActionToHistoryOperationMapping, ReviewLevelType } from 'app/config/constants/firebase';
import { HistoryOperationType, HistoryRecord, History } from 'app/shared/model/firebase/firebase.model';
import { ReviewLevel, BaseReviewLevel } from './firebase-review-utils';

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
