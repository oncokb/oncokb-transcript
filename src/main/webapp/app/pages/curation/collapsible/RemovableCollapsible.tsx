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
  if (review?.updatedBy && review?.removed) {
    infoComponent = getReviewInfo(review.updatedBy, new Date(review.updateTime).toString(), ReviewTypeTitle[ReviewAction.DELETE]);
  }

  return <Collapsible {...collapsibleProps} info={infoComponent} displayOptions={{ hideAction: review?.removed }} />;
};
