import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from './Collapsible';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import {
  BaseReviewLevel,
  MultiSelectionReviewLevel,
  ReviewLevel,
  getCompactReviewInfo,
  isCreateReview,
  isDeleteReview,
  reformatReviewTitle,
  reviewLevelSortMethod,
} from 'app/shared/util/firebase/firebase-review-utils';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DANGER, SUCCESS, WARNING } from 'app/config/colors';
import TextWithRefs from 'app/shared/links/TextWithRefs';
import DefaultBadge from 'app/shared/badge/DefaultBadge';
import { ReviewAction, ReviewActionLabels, ReviewLevelType } from 'app/config/constants/firebase';
import _ from 'lodash';
import { CollapsibleColorProps, CollapsibleDisplayProps } from './BaseCollapsible';
import { getReviewInfo } from 'app/shared/util/firebase/firebase-utils';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';

export enum ReviewType {
  CREATE,
  UPDATE,
  DELETE,
}

export enum ActionType {
  ACCEPT,
  REJECT,
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

const REACT_DIFF_VIEWER_STYLES = {
  contentText: {
    fontFamily: 'inherit',
  },
  codeFold: {
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
};

export interface IReviewCollapsibleProps {
  hugoSymbol: string;
  baseReviewLevel: BaseReviewLevel;
  isGermline: boolean;
  handleReject?: (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => Promise<void>;
  handleAccept?: (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => Promise<void>;
  parentDelete?: (reviewlLevelId: string, action: ActionType) => void;
  rootDelete?: (reviewLevelId: string, action: ActionType) => void;
  splitView?: boolean;
}

export const ReviewCollapsible = ({
  hugoSymbol,
  baseReviewLevel,
  isGermline,
  handleReject,
  handleAccept,
  parentDelete,
  rootDelete,
  splitView,
}: IReviewCollapsibleProps) => {
  const [rootReview, setRootReview] = useState<BaseReviewLevel>(baseReviewLevel);
  const [reviewChildren, setReviewChildren] = useState<BaseReviewLevel[]>([]);

  useEffect(() => {
    Object.keys(baseReviewLevel.children).forEach(
      key => (baseReviewLevel.children[key] = getCompactReviewInfo(baseReviewLevel.children[key])),
    );
    setRootReview(baseReviewLevel);
    setReviewChildren(Object.values(baseReviewLevel.children));
  }, [baseReviewLevel]);

  const isUnderCreationOrDeletion = rootReview.nestedUnderCreateOrDelete;

  const reviewAction = useMemo(() => {
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      const reviewLevel = rootReview as ReviewLevel;
      return reviewLevel.reviewInfo.reviewAction;
    }
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      return ReviewAction.UPDATE;
    }
  }, [rootReview]);

  const borderLeftColor = useMemo(() => {
    let color = ReviewCollapsibleColorClass[reviewAction];
    if (isUnderCreationOrDeletion || rootReview.reviewLevelType === ReviewLevelType.META) {
      color = undefined;
    }
    return color;
  }, [rootReview]);

  const markCollapsibleAsPending = (reviewLevelId: string, action: ActionType) => {
    // Optimistic UI render: we assume that the save is successfull and immediately hide
    // the collapsible when an action is clicked.
    const newReviewChildren = reviewChildren.map(c => {
      if (c.id === reviewLevelId) {
        c.hideLevel = true;
      }
      return c;
    });
    if (newReviewChildren.length === 0 || newReviewChildren.filter(c => c.hideLevel).length === reviewChildren.length) {
      handleActionClick(action);
    } else {
      setReviewChildren(newReviewChildren);
    }
  };

  const handleActionClick = async (action: ActionType) => {
    if (parentDelete) {
      // The child needs to tell the parent to update the parent's reviewChildren state, so a rerender is triggered.
      parentDelete(rootReview.id, action);
    } else {
      // The collapsible is a child on level 1 and has a parent at level 0 (root), so the ReviewPage needs to update it's reviewChildren state
      rootDelete(rootReview.id, action);
    }

    // After marking collapsible as pending, it will be removed from the view. Now we need to save to firebase
    try {
      if (action === ActionType.ACCEPT) {
        await handleAccept(hugoSymbol, getReviewLevelsForActions(), isGermline);
      } else if (action === ActionType.REJECT) {
        await handleReject(hugoSymbol, getReviewLevelsForActions(), isGermline);
      }
    } catch (error) {
      // Perform a rollback if the save fails. We can show the collapsible again when the core API fails.
      // However for Firebase, we will have tell the user to stop reviewing and a dev needs to fix the data.
      notifyError(error);
    }
  };

  const getReviewLevelsForActions = () => {
    let reviewLevels: ReviewLevel[] = [];
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      reviewLevels = reviewLevels.concat((rootReview as MultiSelectionReviewLevel).getReviewLevels());
    }
    if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      reviewLevels.push(rootReview as ReviewLevel);
    }
    return reviewLevels;
  };

  const getReviewActions = () => {
    if (isUnderCreationOrDeletion) {
      return undefined;
    }
    if (rootReview.reviewLevelType === ReviewLevelType.META) {
      return undefined;
    }
    return (
      <>
        <ActionIcon icon={faCheck} color={SUCCESS} onClick={() => handleActionClick(ActionType.ACCEPT)} />
        <ActionIcon
          icon={faTimes}
          color={DANGER}
          onClick={() => {
            handleActionClick(ActionType.REJECT);
          }}
        />
      </>
    );
  };

  const getEditorInfo = () => {
    let reviewLevel: ReviewLevel;
    if (isUnderCreationOrDeletion || rootReview.reviewLevelType === ReviewLevelType.META) {
      return <></>;
    } else if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      reviewLevel = rootReview as ReviewLevel;
    } else if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      const multiReviewLevel = rootReview as MultiSelectionReviewLevel;
      const multiSelectionReviews = multiReviewLevel.getReviewLevels();
      const numEditors = _.uniq(multiSelectionReviews.map(r => r.reviewInfo.review.updatedBy)).length;
      if (numEditors > 1) {
        return getReviewInfo('multiple users', ReviewTypeTitle[reviewAction]);
      }
      reviewLevel = multiSelectionReviews[0];
    }

    const action = ReviewTypeTitle[reviewAction];
    const editor = reviewLevel.reviewInfo.review.updatedBy;
    const updatedTime = new Date(reviewLevel.reviewInfo.review.updateTime).toString();
    return getReviewInfo(editor, action, updatedTime);
  };

  const getReviewableContent = () => {
    if (isDeletion) {
      return undefined;
    }
    const reviewLevel = baseReviewLevel as ReviewLevel;
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
      let oldValue = reviewLevel.historyData.oldState as string;
      let newValue = reviewLevel.historyData.newState as string;
      if (!isUnderCreationOrDeletion && oldValue !== '' && newValue !== '') {
        oldValue = oldValue?.replace(/\.\s+/g, '.\n');
        newValue = newValue?.replace(/\.\s+/g, '.\n');
      }
      return (
        <div className="mb-2">
          <ReactDiffViewer
            styles={REACT_DIFF_VIEWER_STYLES}
            showDiffOnly
            extraLinesSurroundingDiff={0}
            oldValue={oldValue}
            newValue={newValue}
            compareMethod={reviewLevel?.reviewInfo.diffMethod || DiffMethod.WORDS}
            splitView={splitView ? reviewLevel.reviewInfo.review.lastReviewed && reviewLevel.currentVal : false}
            hideLineNumbers
            renderContent={source => {
              return <TextWithRefs content={source} />;
            }}
          />
        </div>
      );
    }
  };

  const getMultiSelectionReviewContent = () => {
    const multiSelectionReviewLevel = baseReviewLevel as MultiSelectionReviewLevel;
    const joinedNewParts = [];
    const joinedOldParts = [];
    for (const reviewLevel of multiSelectionReviewLevel.getReviewLevels()) {
      joinedNewParts.push(reviewLevel.currentVal);
      joinedOldParts.push(reviewLevel.reviewInfo.lastReviewedString);
    }
    return (
      <div className="mb-2">
        <ReactDiffViewer
          styles={REACT_DIFF_VIEWER_STYLES}
          showDiffOnly
          extraLinesSurroundingDiff={0}
          oldValue={joinedOldParts.filter(p => p !== '').join(', ')}
          newValue={joinedNewParts.filter(p => p !== '').join(', ')}
          compareMethod={DiffMethod.WORDS}
          hideLineNumbers
          splitView={false}
        />
      </div>
    );
  };

  const getCollapsibleBody = () => {
    const children = rootReview.children && Object.values(rootReview.children);

    if (baseReviewLevel.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      return getMultiSelectionReviewContent();
    } else if (children?.length > 0) {
      return Object.values(rootReview.children)
        ?.sort(reviewLevelSortMethod)
        ?.map(childReview => (
          <ReviewCollapsible
            splitView={splitView}
            key={childReview.title}
            isGermline={isGermline}
            baseReviewLevel={childReview}
            hugoSymbol={hugoSymbol}
            handleAccept={handleAccept}
            handleReject={handleReject}
            parentDelete={markCollapsibleAsPending}
          />
        ));
    } else {
      return getReviewableContent();
    }
  };

  const getColorOptions = () => {
    let colorOptions: CollapsibleColorProps;
    const disableBorder = baseReviewLevel.nestedUnderCreateOrDelete || baseReviewLevel.reviewLevelType === ReviewLevelType.META;
    if (disableBorder) {
      colorOptions = { hideLeftBorder: true };
    } else {
      colorOptions = { hideLeftBorder: false, borderLeftColor, backgroundColor: '#FFFFFF' };
    }
    return colorOptions;
  };

  const isDeletion = isDeleteReview(rootReview);

  const defaultReviewCollapsibleDisplayOptions: CollapsibleDisplayProps = {
    disableCollapsible: isDeletion,
    hideAction: false,
    hideInfo: false,
    hideToggle: !rootReview.hasChildren() && reviewAction === ReviewAction.CREATE,
  };

  if (rootReview.hideLevel) {
    return <></>;
  }

  return (
    <Collapsible
      defaultOpen
      collapsibleClassName={'mb-1'}
      title={reformatReviewTitle(baseReviewLevel)}
      colorOptions={getColorOptions()}
      info={getEditorInfo()}
      action={getReviewActions()}
      displayOptions={{ ...defaultReviewCollapsibleDisplayOptions }}
      isPendingDelete={isDeletion}
      badge={
        baseReviewLevel.reviewLevelType !== ReviewLevelType.META &&
        !baseReviewLevel.nestedUnderCreateOrDelete && (
          <DefaultBadge color={ReviewCollapsibleBootstrapClass[reviewAction]} text={ReviewActionLabels[reviewAction]} />
        )
      }
    >
      {getCollapsibleBody()}
    </Collapsible>
  );
};
