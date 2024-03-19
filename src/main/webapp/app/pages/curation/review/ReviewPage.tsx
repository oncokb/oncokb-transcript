import { componentInject } from 'app/shared/util/typed-inject';
import { getSectionClassName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, FormGroup, Input, Label, Row } from 'reactstrap';
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
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { onValue, ref } from 'firebase/database';
import { ReviewCollapsible } from '../collapsible/ReviewCollapsible';

interface IReviewPageProps extends StoreProps {
  hugoSymbol: string;
  reviewFinished: boolean;
  handleReviewFinished: (isFinished: boolean) => void;
  drugList: readonly IDrug[];
}

const ReviewPage = (props: IReviewPageProps) => {
  const firebaseGenePath = getFirebasePath('GENE', props.hugoSymbol);
  const firebaseMetaReviewPath = `${getFirebasePath('META_GENE', props.hugoSymbol)}/review`;

  const [geneData, setGeneData] = useState(null);
  const [metaReview, setMetaReview] = useState(null);

  const [reviewUuids, setReviewUuids] = useState([]);
  const [rootReview, setRootReview] = useState(new BaseReviewLevel());
  const [editorReviewMap, setEditorReviewMap] = useState(new EditorReviewMap());
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(props.firebaseDb, firebaseGenePath), snapshot => {
        setGeneData(snapshot.val());
      })
    );

    callbacks.push(
      onValue(ref(props.firebaseDb, firebaseMetaReviewPath), snapshot => {
        setMetaReview(snapshot.val());
      })
    );

    return () => callbacks.forEach(callback => callback?.());
  }, []);

  useEffect(() => {
    if (metaReview) {
      const uuids = [];
      for (const key of Object.keys(metaReview)) {
        if (metaReview[key] === true) {
          uuids.push(key);
        }
      }
      setReviewUuids(uuids);
    }
  }, [metaReview]);

  useEffect(() => {
    if (geneData) {
      const reviewMap = new EditorReviewMap();
      const reviews = findGeneLevelReviews(props.drugList, geneData, reviewUuids, reviewMap);
      Object.keys(reviews.children).forEach(key => (reviews.children[key] = getCompactReviewInfo(reviews.children[key])));
      setEditorReviewMap(reviewMap);
      setRootReview(reviews);
      props.handleReviewFinished(!reviews.hasChildren());
    }
  }, [geneData, reviewUuids]);

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
        <>
          <Row className="mb-4">
            <Col>
              <FormGroup check inline>
                <Input
                  type="radio"
                  checked={!splitView}
                  onChange={() => {
                    setSplitView(false);
                  }}
                />
                <Label check>Unified View</Label>
              </FormGroup>
              <FormGroup check inline>
                <Input type="radio" checked={splitView} onChange={() => setSplitView(true)} />
                <Label check>Split View</Label>
              </FormGroup>
            </Col>
          </Row>
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
        </>
      )}

      <Row>
        <Col>
          {Object.values(rootReview.children)
            .sort(reviewLevelSortMethod)
            .map(reviewLevel => (
              <ReviewCollapsible
                splitView={splitView}
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

const mapStoreToProps = ({ firebaseStore, firebaseGeneStore, authStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  fullName: authStore.fullName,
  rejectReviewChangeHandler: firebaseGeneStore.rejectChanges,
  acceptReviewChangeHandler: firebaseGeneStore.acceptChanges,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ReviewPage));
