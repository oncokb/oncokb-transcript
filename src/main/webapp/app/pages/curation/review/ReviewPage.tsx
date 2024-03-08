import { componentInject } from 'app/shared/util/typed-inject';
import { getSectionClassName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Row } from 'reactstrap';
import { ReviewCollapsible } from '../collapsible/ReviewCollapsible';
import _ from 'lodash';
import {
  BaseReviewLevel,
  EditorReviewMap,
  ReviewLevel,
  findGeneLevelReviews,
  getCompactReviewInfo,
  reviewLevelSortMethod,
} from 'app/shared/util/firebase/firebase-review-utils';
import { IDrug } from 'app/shared/model/drug.model';

interface IReviewPageProps extends StoreProps {
  firebasePath: string;
  hugoSymbol: string;
  reviewFinished: boolean;
  handleReviewFinished: (isFinished: boolean) => void;
  drugList: readonly IDrug[];
}

const ReviewPage = (props: IReviewPageProps) => {
  const [reviewUuids, setReviewUuids] = useState([]);
  const [rootReview, setRootReview] = useState(new BaseReviewLevel());
  const [editorReviewMap, setEditorReviewMap] = useState(new EditorReviewMap());

  useEffect(() => {
    const uuids = [];
    for (const key of Object.keys(props.metaData.review)) {
      if (props.metaData.review[key] === true) {
        uuids.push(key);
      }
    }
    setReviewUuids(uuids);
  }, [props.metaData]);

  useEffect(() => {
    const reviewMap = new EditorReviewMap();
    const reviews = findGeneLevelReviews(props.drugList, props.geneData, reviewUuids, reviewMap);
    Object.keys(reviews.children).forEach(key => (reviews.children[key] = getCompactReviewInfo(reviews.children[key])));
    setEditorReviewMap(reviewMap);
    setRootReview(reviews);
    props.handleReviewFinished(!reviews.hasChildren());
  }, [props.geneData, reviewUuids]);

  const acceptAllChangesFromEditors = (editors: string[]) => {
    let reviewLevels = [] as ReviewLevel[];
    for (const editor of editors) {
      reviewLevels = reviewLevels.concat(editorReviewMap.getReviewsByEditor(editor));
    }
    props.acceptReviewChangeHandler(props.hugoSymbol, reviewLevels);
  };

  return (
    <>
      <Row className={`${getSectionClassName()} justify-content-between`}>
        <Col>
          {props.reviewFinished ? (
            <Alert color="success" fade={false}>
              <div className="d-flex justify-content-center">All items have been reviewed. Click the Review Complete button to exit.</div>
            </Alert>
          ) : (
            <Alert color="warning" fade={false}>
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-center">
                  You are currently in Review mode. Click the Review Complete button to exit.
                </div>
                <div className="d-flex justify-content-center">Your actions CANNOT be reverted.</div>
              </div>
            </Alert>
          )}
        </Col>
      </Row>
      {!props.reviewFinished && (
        <Row>
          <Col>
            <Button
              className="mr-2 mb-2"
              outline
              color="primary"
              size="sm"
              onClick={() => acceptAllChangesFromEditors(editorReviewMap.getEditorList())}
            >
              Accept all changes
            </Button>
            {editorReviewMap.getEditorList().map(editor => (
              <Button
                className="mr-2 mb-2"
                key={editor}
                outline
                color="primary"
                size="sm"
                onClick={() => acceptAllChangesFromEditors([editor])}
              >
                Accept all changes from {editor}
              </Button>
            ))}
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          {Object.values(rootReview.children)
            .sort(reviewLevelSortMethod)
            .map(reviewLevel => (
              <ReviewCollapsible
                hugoSymbol={props.hugoSymbol}
                key={reviewLevel.currentValPath}
                baseReviewLevel={reviewLevel}
                handleAccept={props.acceptReviewChangeHandler}
                handleDelete={props.rejectReviewChangeHandler}
              />
            ))}
        </Col>
      </Row>
    </>
  );
};

const mapStoreToProps = ({ firebaseGeneStore, firebaseMetaStore, authStore }: IRootStore) => ({
  geneData: firebaseGeneStore.data,
  metaData: firebaseMetaStore.data,
  fullName: authStore.fullName,
  rejectReviewChangeHandler: firebaseGeneStore.rejectChanges,
  acceptReviewChangeHandler: firebaseGeneStore.acceptChanges,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ReviewPage));
