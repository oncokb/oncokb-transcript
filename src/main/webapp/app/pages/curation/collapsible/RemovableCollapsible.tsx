import React from 'react';
import Collapsible, { CollapsibleProps } from './Collapsible';
import { getReviewInfo } from 'app/shared/util/firebase/firebase-utils';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { ReviewAction } from 'app/config/constants/firebase';
import { ReviewTypeTitle } from './ReviewCollapsible';

export interface IRemovableCollapsibleProps extends CollapsibleProps {
  review: Review;
}

export const RemovableCollapsible = ({ review, ...collapsibleProps }: IRemovableCollapsibleProps) => {
  let infoComponent = collapsibleProps.info;
  if (review?.updatedBy) {
    let reviewAction: ReviewAction;
    if (review?.removed) reviewAction = ReviewAction.DELETE;
    if (review?.demotedToVus) reviewAction = ReviewAction.DEMOTE_MUTATION;
    if (reviewAction) {
      infoComponent = getReviewInfo(review.updatedBy, ReviewTypeTitle[reviewAction], new Date(review.updateTime).toString());
    }
  }

  return <Collapsible {...collapsibleProps} info={infoComponent} displayOptions={{ hideAction: review?.removed }} />;
};
