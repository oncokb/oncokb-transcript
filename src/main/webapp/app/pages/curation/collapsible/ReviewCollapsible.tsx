import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from './Collapsible';
import {
  BaseReviewLevel,
  MultiSelectionReviewLevel,
  ReviewLevel,
  getCompactReviewInfo,
  isCreateReview,
  isDeleteReview,
  reviewLevelSortMethod,
  showAsFirebaseTextArea,
  getGenePathFromValuePath,
} from 'app/shared/util/firebase/firebase-review-utils';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DANGER, SUCCESS, WARNING } from 'app/config/colors';
import DefaultBadge from 'app/shared/badge/DefaultBadge';
import { ReviewAction, ReviewActionLabels, ReviewLevelType } from 'app/config/constants/firebase';
import _ from 'lodash';
import { CollapsibleColorProps, CollapsibleDisplayProps } from './BaseCollapsible';
import { getReviewInfo, getTxName } from 'app/shared/util/firebase/firebase-utils';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import DiffViewer, { FirebaseContent } from 'app/components/diff-viewer/DiffViewer';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import { DrugCollection, Gene } from 'app/shared/model/firebase/firebase.model';
import { IDrug } from 'app/shared/model/drug.model';
import { ReviewCollapsibleTitle } from './ReviewCollapsibleTitle';
import { Review } from 'app/shared/model/firebase/firebase.model';

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

const TREATMENT_NAME_REGEX = /treatments\/\d+\/name$/;

export interface IReviewCollapsibleProps {
  drugListRef: DrugCollection;
  entrezGeneId: number;
  gene: Gene;
  hugoSymbol: string;
  baseReviewLevel: BaseReviewLevel;
  isGermline: boolean;
  firebase: FirebaseContent;
  parentDelete?: (reviewlLevelId: string, action: ActionType, isPending?: boolean) => void;
  rootDelete?: (isPending?: boolean) => void;
  handleAccept?: FirebaseGeneReviewService['acceptChanges'];
  handleReject?: (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => Promise<void>;
  handleCreateAction?: (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean, action: ActionType) => Promise<void>;
  disableActions?: boolean;
  isRoot?: boolean;
  drugList: readonly IDrug[];
}

export const ReviewCollapsible = ({
  hugoSymbol,
  baseReviewLevel,
  isGermline,
  handleAccept,
  handleReject,
  handleCreateAction,
  parentDelete,
  rootDelete,
  firebase,
  drugList,
  disableActions = false,
  isRoot = false,
  drugListRef,
  entrezGeneId,
  gene,
}: IReviewCollapsibleProps) => {
  const [rootReview, setRootReview] = useState<BaseReviewLevel>(baseReviewLevel);
  const [reviewChildren, setReviewChildren] = useState<BaseReviewLevel[]>([]);

  useEffect(() => {
    if (baseReviewLevel.hasChildren()) {
      baseReviewLevel.children.forEach(
        (value, index) => (baseReviewLevel.children[index] = getCompactReviewInfo(value as BaseReviewLevel & Review)),
      );
    }
    setRootReview(baseReviewLevel);
    setReviewChildren(baseReviewLevel.children ?? []);
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
    let color = reviewAction !== undefined ? ReviewCollapsibleColorClass[reviewAction] : undefined;
    if (isCreateReview(baseReviewLevel)) {
      return color;
    }
    if (baseReviewLevel.reviewLevelType === ReviewLevelType.META) {
      color = undefined;
    } else if (baseReviewLevel.nestedUnderCreateOrDelete) {
      color = undefined;
    }
    return color;
  }, [rootReview]);

  /**
   * Optimistic UI render: we assume that the save is successful and immediately hide the collapsible when an action is clicked.
   * @param reviewLevelId id of review level to hide
   * @param action whether user is accepting/rejecting changes
   */
  const hideCollapsible = (reviewLevelId: string, action: ActionType) => {
    const newReviewChildren = reviewChildren.map(c => {
      if (c.id === reviewLevelId) {
        c.hideLevel = true;
      }
      return c;
    });

    const allChildrenPending = newReviewChildren.filter(c => c.hideLevel).length === reviewChildren.length;

    if (allChildrenPending) {
      if (parentDelete) {
        parentDelete(rootReview.id, action, allChildrenPending);
      } else {
        rootDelete?.(allChildrenPending);
      }
    } else {
      setReviewChildren(newReviewChildren);
    }
  };

  /**
   * Once the review level changes have been committed to Firebase, this will remove the review level from React state.
   * @param reviewLevelId id of review level to hide
   * @param action whether user is accepting/rejecting changes
   */
  const deleteCollapsible = (reviewLevelId: string, action: ActionType) => {
    const newReviewChildren = reviewChildren.filter(c => c.id !== reviewLevelId);

    if (newReviewChildren.length === 0) {
      if (parentDelete) {
        parentDelete(rootReview.id, action, false);
      } else {
        rootDelete?.(false);
      }
      if (isCreateReview(rootReview)) {
        handleCreateAction?.(hugoSymbol, rootReview as ReviewLevel, isGermline, ActionType.ACCEPT);
      }
    } else {
      setReviewChildren(newReviewChildren);
    }
  };

  /**
   * This is the "parentDelete" prop that is passed to children reviews. The children will use this prop
   * to modify it's parent's state to trigger a re-render.
   */
  const deleteHandlerForChild = (reviewLevelId: string, action: ActionType, isPending = false) => {
    if (isPending) {
      hideCollapsible(reviewLevelId, action);
    } else {
      deleteCollapsible(reviewLevelId, action);
    }
  };

  const handleActionClick = async (action: ActionType) => {
    if (parentDelete) {
      // The child needs to tell the parent to update the parent's reviewChildren state, so a rerender is triggered.
      parentDelete(rootReview.id, action, true);
    }

    // After marking collapsible as pending, it will be removed from the view. Now we need to save to firebase
    try {
      if (action === ActionType.ACCEPT) {
        await handleAccept?.({ hugoSymbol, reviewLevels: getReviewLevelsForActions(), isGermline, drugListRef, entrezGeneId, gene });
      } else if (action === ActionType.REJECT) {
        await handleReject?.(hugoSymbol, getReviewLevelsForActions(), isGermline);
      }
      // After saved to Firebase, remove from state.
      if (parentDelete) {
        parentDelete(rootReview.id, action);
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
    if (rootReview.reviewLevelType === ReviewLevelType.META) {
      return undefined;
    }
    const deletionAction = (
      <ActionIcon
        icon={faTimes}
        color={DANGER}
        onClick={() => {
          handleActionClick(ActionType.REJECT);
        }}
        disabled={disableActions}
      />
    );
    if (isCreateReview(rootReview)) {
      if (rootReview.nestedUnderCreateOrDelete) {
        return undefined;
      }
      // Reviewable content should be reviewed individually under a create event. Once fully reviewed
      // then the entity will be created.
      // We do allow the user to reject the create.
      return deletionAction;
    }
    return (
      <>
        <ActionIcon icon={faCheck} color={SUCCESS} onClick={() => handleActionClick(ActionType.ACCEPT)} disabled={disableActions} />
        {deletionAction}
      </>
    );
  };

  const getEditorInfo = () => {
    let reviewLevel: ReviewLevel | undefined = undefined;
    if (rootReview.reviewLevelType === ReviewLevelType.META) {
      return <></>;
    } else if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      if (isCreateReview(rootReview) && isUnderCreationOrDeletion) {
        return <></>;
      }
      reviewLevel = rootReview as ReviewLevel;
    } else if (rootReview.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      const multiReviewLevel = rootReview as MultiSelectionReviewLevel;
      const multiSelectionReviews = multiReviewLevel.getReviewLevels();
      const numEditors = _.uniq(multiSelectionReviews.map(r => r.reviewInfo.review.updatedBy)).length;
      if (numEditors > 1) {
        return getReviewInfo('multiple users', ReviewTypeTitle[reviewAction ?? '']);
      }
      reviewLevel = multiSelectionReviews[0];
    }

    const action = ReviewTypeTitle[reviewAction ?? ''];
    const editor = reviewLevel?.reviewInfo.review.updatedBy ?? '';
    const updatedTime = reviewLevel !== undefined ? new Date(reviewLevel.reviewInfo.review.updateTime).toString() : undefined;
    return getReviewInfo(editor, action, updatedTime);
  };

  const getBadge = () => {
    if (isUnderCreationOrDeletion) {
      return undefined;
    }
    return <DefaultBadge color={ReviewCollapsibleBootstrapClass[reviewAction ?? '']} text={ReviewActionLabels[reviewAction ?? '']} />;
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
      const newExclusions = _.difference(currentCancerTypes, lastReviewedCancerTypes ?? []);
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
      if (TREATMENT_NAME_REGEX.test(reviewLevel.valuePath)) {
        oldValue = getTxName(drugList, oldValue);
        newValue = getTxName(drugList, newValue);
      }
      const showTextArea = showAsFirebaseTextArea(hugoSymbol, reviewLevel.valuePath, isGermline);
      return (
        <>
          <div className="mb-2">
            {showTextArea && <DiffViewer type={'tabs'} new={firebase} old={oldValue || ''} />}
            {!showTextArea && <DiffViewer type={'stack'} new={newValue} old={oldValue || ''} />}
          </div>
        </>
      );
    }
  };

  const getMultiSelectionReviewContent = () => {
    const multiSelectionReviewLevel = baseReviewLevel as MultiSelectionReviewLevel;
    const joinedNewParts: string[] = [];
    const joinedOldParts: string[] = [];
    for (const reviewLevel of multiSelectionReviewLevel.getReviewLevels()) {
      joinedNewParts.push(reviewLevel.currentVal);
      if (reviewLevel.reviewInfo.lastReviewedString) {
        joinedOldParts.push(reviewLevel.reviewInfo.lastReviewedString);
      }
    }
    return (
      <div className="mb-2">
        <DiffViewer
          type={'stack'}
          new={joinedNewParts.filter(p => p !== '').join(', ')}
          old={joinedOldParts.filter(p => p !== '').join(', ')}
        />
      </div>
    );
  };

  const getCollapsibleBody = () => {
    const children = rootReview.children;

    if (baseReviewLevel.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) {
      return getMultiSelectionReviewContent();
    } else if (children && children.length > 0) {
      return rootReview.children?.sort(reviewLevelSortMethod)?.map(childReview => (
        <ReviewCollapsible
          key={childReview.titleParts.join('/')}
          isGermline={isGermline}
          baseReviewLevel={childReview}
          hugoSymbol={hugoSymbol}
          handleAccept={handleAccept}
          handleReject={handleReject}
          handleCreateAction={handleCreateAction}
          parentDelete={deleteHandlerForChild}
          disableActions={disableActions}
          firebase={{
            path: getGenePathFromValuePath(hugoSymbol, childReview.valuePath, isGermline),
            db: firebase?.db,
          }}
          drugList={drugList}
          gene={gene}
          entrezGeneId={entrezGeneId}
          drugListRef={drugListRef}
        />
      ));
    } else {
      return getReviewableContent();
    }
  };

  const getColorOptions = () => {
    let colorOptions: CollapsibleColorProps;
    let disableBorder = false;
    if (isUnderCreationOrDeletion) {
      disableBorder = true;
    } else if (isCreateReview(baseReviewLevel)) {
      disableBorder = false;
    } else if (baseReviewLevel.reviewLevelType === ReviewLevelType.META) {
      disableBorder = true;
    }

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

  if (isRoot) {
    return <div>{getCollapsibleBody()}</div>;
  }

  if (rootReview.hideLevel) {
    return <></>;
  }

  return (
    <Collapsible
      idPrefix={baseReviewLevel.titleParts.join('/')}
      defaultOpen
      collapsibleClassName={'mb-1'}
      title={<ReviewCollapsibleTitle baseReviewLevel={baseReviewLevel} />}
      colorOptions={getColorOptions()}
      info={getEditorInfo()}
      action={getReviewActions()}
      displayOptions={{ ...defaultReviewCollapsibleDisplayOptions }}
      isPendingDelete={isDeletion}
      badge={getBadge()}
    >
      {getCollapsibleBody()}
    </Collapsible>
  );
};
