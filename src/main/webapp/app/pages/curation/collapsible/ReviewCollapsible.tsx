import React, { useMemo } from 'react';
import Collapsible from './Collapsible';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import {
  BaseReviewLevel,
  ReviewLevel,
  ReviewLevelType,
  getCompactReviewInfo,
  reformatReviewTitle,
  reviewLevelSortMethod,
} from 'app/shared/util/firebase/firebase-review-utils';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DANGER, SUCCESS, WARNING } from 'app/config/colors';
import TextWithRefs from 'app/shared/links/TextWithRefs';
import DefaultBadge from 'app/shared/badge/DefaultBadge';
import { ReviewAction, ReviewActionLabels } from 'app/config/constants/firebase';
import _ from 'lodash';
import { CollapsibleColorProps, CollapsibleDisplayProps } from './BaseCollapsible';
import { getReviewInfo } from 'app/shared/util/firebase/firebase-utils';

export enum ReviewType {
  CREATE,
  UPDATE,
  DELETE,
}

export const ReviewTypeTitle: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: 'Created',
  [ReviewAction.UPDATE]: 'Updated',
  [ReviewAction.DELETE]: 'Deleted',
  [ReviewAction.NAME_CHANGE]: 'Name changed',
  [ReviewAction.PROMOTE_VUS]: 'Promoted from VUS',
  [ReviewAction.DEMOTE_MUTATION]: 'Demoted to VUS',
};

const ReviewCollapsibleColorClass: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: SUCCESS,
  [ReviewAction.UPDATE]: WARNING,
  [ReviewAction.DELETE]: DANGER,
  [ReviewAction.NAME_CHANGE]: WARNING,
  [ReviewAction.PROMOTE_VUS]: SUCCESS,
  [ReviewAction.DEMOTE_MUTATION]: DANGER,
};

const ReviewCollapsibleBootstrapClass = {
  [ReviewAction.CREATE]: 'success',
  [ReviewAction.UPDATE]: 'warning',
  [ReviewAction.DELETE]: 'danger',
  [ReviewAction.NAME_CHANGE]: 'warning',
  [ReviewAction.PROMOTE_VUS]: 'success',
  [ReviewAction.DEMOTE_MUTATION]: 'danger',
};

export interface IReviewCollapsibleProps {
  hugoSymbol: string;
  baseReviewLevel: BaseReviewLevel;
  isGermline: boolean;
  handleDelete?: (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) => void;
  handleAccept?: (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => void;
  splitView?: boolean;
}

export const ReviewCollapsible = (props: IReviewCollapsibleProps) => {
  const rootReview: BaseReviewLevel = useMemo(() => {
    Object.keys(props.baseReviewLevel.children).forEach(
      key => (props.baseReviewLevel.children[key] = getCompactReviewInfo(props.baseReviewLevel.children[key]))
    );
    return props.baseReviewLevel;
  }, [props.baseReviewLevel]);

  const isUnderCreationOrDeletion = rootReview.nestedUnderCreateOrDelete;

  const reviewAction = useMemo(() => {
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      const reviewLevel = rootReview as ReviewLevel;
      return reviewLevel.reviewInfo.reviewAction;
    }
  }, [rootReview]);

  const borderLeftColor = useMemo(() => {
    let color = ReviewCollapsibleColorClass[reviewAction];
    if (isUnderCreationOrDeletion || rootReview.reviewLevelType === ReviewLevelType.META) {
      color = undefined;
    }
    return color;
  }, [rootReview]);

  const getReviewActions = () => {
    return !isUnderCreationOrDeletion && rootReview.reviewLevelType !== ReviewLevelType.META ? (
      <>
        <ActionIcon
          icon={faCheck}
          color={SUCCESS}
          onClick={() => {
            props.handleAccept(props.hugoSymbol, [props.baseReviewLevel as ReviewLevel], props.isGermline);
          }}
        />
        <ActionIcon
          icon={faTimes}
          color={DANGER}
          onClick={() => {
            props.handleDelete(props.hugoSymbol, props.baseReviewLevel as ReviewLevel, props.isGermline);
          }}
        />
      </>
    ) : undefined;
  };

  const getEditorInfo = () => {
    if (!isUnderCreationOrDeletion && rootReview.reviewLevelType !== ReviewLevelType.META) {
      const reviewLevel = rootReview as ReviewLevel;
      const action = ReviewTypeTitle[reviewAction];
      const editor = reviewLevel.reviewInfo.review.updatedBy;
      const updatedTime = new Date(reviewLevel.reviewInfo.review.updateTime).toString();
      return getReviewInfo(editor, updatedTime, action);
    }
  };

  const newStyles = {
    contentText: {
      fontFamily: 'inherit',
    },
    codeFold: {
      fontFamily: 'inherit',
      backgroundColor: 'white',
    },
  };

  const getCollapsibleContent = () => {
    if (isDeletion) {
      return undefined;
    }
    const reviewLevel = props.baseReviewLevel as ReviewLevel;
    if (reviewLevel.valuePath.includes('excludedRCTs')) {
      const lastReviewedCancerTypes =
        reviewLevel?.reviewInfo.lastReviewedString === '' ? [] : reviewLevel?.reviewInfo.lastReviewedString?.split('\t');
      const currentCancerTypes = reviewLevel.currentVal === '' ? [] : reviewLevel.currentVal.split('\t');
      const newExclusions = _.difference(currentCancerTypes, lastReviewedCancerTypes);
      const revertedExclusions = _.difference(lastReviewedCancerTypes, currentCancerTypes);
      return (
        <>
          {newExclusions.length > 0 && (
            <>
              <div>
                Cancer Type(s) <span className="text-danger">removed</span> from RCT list:
              </div>

              <div>
                <ol>
                  {newExclusions.map(ct => (
                    <li key={ct}>{ct}</li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {revertedExclusions.length > 0 && (
            <>
              <div>
                Cancer Type(s) <span className="text-success">added</span> back to RCT list:
              </div>
              <div>
                <ol>
                  {revertedExclusions.map(ct => (
                    <li key={ct}>{ct}</li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </>
      );
    }
    if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
      let oldValue = reviewLevel.reviewInfo.lastReviewedString;
      let newValue = reviewLevel.currentVal.toString();
      if (!isUnderCreationOrDeletion && oldValue !== '' && newValue !== '') {
        oldValue = oldValue?.replace(/\.\s+/g, '.\n');
        newValue = newValue?.replace(/\.\s+/g, '.\n');
      }
      return (
        <div className="mb-2">
          <ReactDiffViewer
            styles={newStyles}
            showDiffOnly
            extraLinesSurroundingDiff={0}
            oldValue={oldValue}
            newValue={newValue}
            compareMethod={reviewLevel?.reviewInfo.diffMethod || DiffMethod.CHARS}
            splitView={props.splitView ? reviewLevel.reviewInfo.review.lastReviewed && reviewLevel.currentVal : false}
            hideLineNumbers
            renderContent={source => {
              return <TextWithRefs content={source} />;
            }}
          />
        </div>
      );
    }
  };

  const getColorOptions = () => {
    let colorOptions: CollapsibleColorProps;
    const disableBorder = props.baseReviewLevel.nestedUnderCreateOrDelete || props.baseReviewLevel.reviewLevelType === ReviewLevelType.META;
    if (disableBorder) {
      colorOptions = { hideLeftBorder: true };
    } else {
      colorOptions = { hideLeftBorder: false, borderLeftColor, backgroundColor: '#FFFFFF' };
    }
    return colorOptions;
  };

  const isDeletion = reviewAction === ReviewAction.DELETE || reviewAction === ReviewAction.DEMOTE_MUTATION;

  const defaultReviewCollapsibleDisplayOptions: CollapsibleDisplayProps = {
    disableCollapsible: isDeletion,
    hideAction: false,
    hideInfo: false,
  };

  return (
    <Collapsible
      defaultOpen
      collapsibleClassName={'mb-1'}
      title={reformatReviewTitle(props.baseReviewLevel)}
      colorOptions={getColorOptions()}
      info={getEditorInfo()}
      action={getReviewActions()}
      displayOptions={{ ...defaultReviewCollapsibleDisplayOptions }}
      isPendingDelete={isDeletion}
      badge={
        props.baseReviewLevel.reviewLevelType !== ReviewLevelType.META &&
        !props.baseReviewLevel.nestedUnderCreateOrDelete && (
          <DefaultBadge color={ReviewCollapsibleBootstrapClass[reviewAction]} text={ReviewActionLabels[reviewAction]} />
        )
      }
    >
      {props.baseReviewLevel.hasChildren()
        ? Object.values(rootReview.children)
            ?.sort(reviewLevelSortMethod)
            ?.map(childReview => {
              return (
                <ReviewCollapsible
                  splitView={props.splitView}
                  key={childReview.title}
                  isGermline={props.isGermline}
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
