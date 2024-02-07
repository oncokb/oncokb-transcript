import React, { useMemo } from 'react';
import Collapsible from './Collapsible';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaRegCircleXmark } from 'react-icons/fa6';
import { TextFormat } from 'react-jhipster';
import { APP_EXPANDED_DATETIME_FORMAT } from 'app/config/constants/constants';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import {
  BaseReviewLevel,
  ReviewAction,
  ReviewLevel,
  ReviewLevelType,
  getCompactReviewInfo,
  reformatReviewTitle,
  reviewLevelSortMethod,
} from 'app/shared/util/firebase/firebase-review-utils';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DANGER, SUCCESS, WARNING } from 'app/config/colors';

export enum ReviewType {
  CREATE,
  UPDATE,
  DELETE,
}

const ReviewTypeTitle: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: 'Created',
  [ReviewAction.UPDATE]: 'Updated',
  [ReviewAction.DELETE]: 'Deleted',
  [ReviewAction.NAME_CHANGE]: 'Updated',
};

const ReviewCollapsibleColorClass: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: SUCCESS,
  [ReviewAction.UPDATE]: WARNING,
  [ReviewAction.DELETE]: DANGER,
  [ReviewAction.NAME_CHANGE]: WARNING,
};

export interface IReviewCollapsibleProps {
  hugoSymbol: string;
  baseReviewLevel: BaseReviewLevel;
  handleDelete?: (hugoSymbol: string, reviewLevel: ReviewLevel) => void;
  handleAccept?: (hugoSymbol: string, reviewLevels: ReviewLevel[]) => void;
}

export const ReviewCollapsible = (props: IReviewCollapsibleProps) => {
  const rootReview: BaseReviewLevel = useMemo(() => {
    Object.keys(props.baseReviewLevel.children).forEach(
      key => (props.baseReviewLevel.children[key] = getCompactReviewInfo(props.baseReviewLevel.children[key]))
    );
    return props.baseReviewLevel;
  }, [props.baseReviewLevel]);

  const reviewAction = useMemo(() => {
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      const reviewLevel = rootReview as ReviewLevel;
      return reviewLevel.reviewAction;
    }
  }, [rootReview]);

  const borderLeftColor = useMemo(() => {
    let color = ReviewCollapsibleColorClass[reviewAction];
    if (rootReview.isUnderCreationOrDeletion || rootReview.reviewLevelType === ReviewLevelType.META) {
      color = undefined;
    }
    return color;
  }, [rootReview]);

  const getReviewActions = () => {
    return !rootReview.isUnderCreationOrDeletion && rootReview.reviewLevelType !== ReviewLevelType.META ? (
      <>
        <ActionIcon
          icon={faCheck}
          color={SUCCESS}
          onClick={() => {
            props.handleAccept(props.hugoSymbol, [props.baseReviewLevel as ReviewLevel]);
          }}
        />
        <ActionIcon
          icon={faTimes}
          color={DANGER}
          onClick={() => {
            props.handleDelete(props.hugoSymbol, props.baseReviewLevel as ReviewLevel);
          }}
        />
      </>
    ) : undefined;
  };

  const getEditorInfo = () => {
    if (!rootReview.isUnderCreationOrDeletion && rootReview.reviewLevelType !== ReviewLevelType.META) {
      const reviewLevel = rootReview as ReviewLevel;
      const action = ReviewTypeTitle[reviewAction];
      const editor = reviewLevel.review.updatedBy;
      const updatedTime = new Date(reviewLevel.review.updateTime).toString();
      return (
        <span style={{ fontSize: '90%' }}>
          {action} by {editor} on{' '}
          <>
            <TextFormat value={updatedTime} type="date" format={APP_EXPANDED_DATETIME_FORMAT} />
          </>
        </span>
      );
    }
  };

  const getCollapsibleContent = () => {
    if (reviewAction === ReviewAction.DELETE) {
      return undefined;
    }
    if (reviewAction === ReviewAction.UPDATE) {
      const reviewLevel = props.baseReviewLevel as ReviewLevel;
      return (
        <div className="mb-2">
          <ReactDiffViewer
            showDiffOnly
            extraLinesSurroundingDiff={0}
            oldValue={reviewLevel.review.lastReviewed?.replace(/\.\s+/g, '.\n')}
            newValue={reviewLevel.currentVal.toString().replace(/\.\s+/g, '.\n')}
            compareMethod={DiffMethod.CHARS}
            splitView={reviewLevel.review.lastReviewed && reviewLevel.currentVal}
            hideLineNumbers
          />
        </div>
      );
    }
  };

  return (
    <Collapsible
      open
      className={'mb-1'}
      title={reformatReviewTitle(props.baseReviewLevel.title)}
      disableLeftBorder={props.baseReviewLevel.isUnderCreationOrDeletion || props.baseReviewLevel.reviewLevelType === ReviewLevelType.META}
      borderLeftColor={borderLeftColor}
      info={getEditorInfo()}
      action={getReviewActions()}
      disableCollapsible={reviewAction === ReviewAction.DELETE}
    >
      {props.baseReviewLevel.hasChildren()
        ? Object.values(rootReview.children)
            ?.sort(reviewLevelSortMethod)
            ?.map(childReview => {
              return (
                <ReviewCollapsible
                  key={childReview.title}
                  baseReviewLevel={childReview}
                  hugoSymbol={props.hugoSymbol}
                  handleAccept={props.handleAccept}
                  handleDelete={props.handleDelete}
                />
              );
            })
        : getCollapsibleContent()}
    </Collapsible>
  );
};
