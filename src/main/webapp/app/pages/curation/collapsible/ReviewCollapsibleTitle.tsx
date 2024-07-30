import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight';
import { ReviewLevelType } from 'app/config/constants/firebase';
import { BaseReviewLevel } from 'app/shared/util/firebase/firebase-review-utils';
import React from 'react';
import _ from 'lodash';

export interface IReviewCollapsibleTitle {
  baseReviewLevel: BaseReviewLevel;
}

export const ReviewCollapsibleTitle = ({ baseReviewLevel }: IReviewCollapsibleTitle) => {
  const titleSeperator = <FontAwesomeIcon icon={faAngleDoubleRight} size="xs" className="ms-2 me-2" />;

  const titleParts = _.cloneDeep(baseReviewLevel.titleParts);
  const isNonActionableLevel = baseReviewLevel.reviewLevelType === ReviewLevelType.META || baseReviewLevel.nestedUnderCreateOrDelete;

  let lastTitlePart;
  if (!isNonActionableLevel) {
    lastTitlePart = titleParts.pop();
  }

  return (
    <>
      {titleParts.map((part, index) => (
        <span key={`${part}-${baseReviewLevel.id}`}>
          <span className="fw-normal">{part}</span>
          {(index < titleParts.length - 1 || lastTitlePart) && titleSeperator}
        </span>
      ))}
      <span className="fw-bold">{lastTitlePart}</span>
    </>
  );
};
