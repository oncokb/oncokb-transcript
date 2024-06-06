import {
  BaseReviewLevel,
  EditorReviewMap,
  ReviewLevel,
  findReviews,
  getCompactReviewInfo,
  reviewLevelSortMethod,
} from 'app/shared/util/firebase/firebase-review-utils';
import { getFirebaseGenePath, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { getSectionClassName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { get, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { ReviewCollapsible } from '../collapsible/ReviewCollapsible';
import { RouteComponentProps } from 'react-router-dom';
import { useMatchGeneEntity } from 'app/hooks/useMatchGeneEntity';
import { GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import GeneHeader from '../header/GeneHeader';

interface IReviewPageProps extends StoreProps, RouteComponentProps<{ hugoSymbol: string }> {}

const ReviewPage: React.FunctionComponent<IReviewPageProps> = (props: IReviewPageProps) => {
  const pathname = props.location.pathname;
  const isGermline = pathname.includes('germline');
  const hugoSymbolParam = props.match.params.hugoSymbol;

  const { geneEntity, hugoSymbol } = useMatchGeneEntity(hugoSymbolParam, props.searchGeneEntities, props.geneEntities);

  const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
  const firebaseMetaReviewPath = `${getFirebaseMetaGenePath(isGermline, hugoSymbol)}/review`;

  const [geneData, setGeneData] = useState(null);
  const [metaReview, setMetaReview] = useState(null);
  const [isLoadingMetaReview, setIsLoadingMetaReview] = useState(false);

  const [isReviewFinished, setIsReviewFinished] = useState(false);

  const [reviewUuids, setReviewUuids] = useState([]);
  const [rootReview, setRootReview] = useState<BaseReviewLevel>(undefined);
  const [editorReviewMap, setEditorReviewMap] = useState(new EditorReviewMap());
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    if (geneEntity && props.firebaseInitSuccess) {
      // Fetch the data when the user enters review mode. We don't use a listener
      // because there shouldn't be another user editing the gene when it is being reviewed.
      get(ref(props.firebaseDb, firebaseGenePath)).then(snapshot => setGeneData(snapshot.val()));
      setIsLoadingMetaReview(true);
      get(ref(props.firebaseDb, firebaseMetaReviewPath))
        .then(snapshot => setMetaReview(snapshot.val()))
        .finally(() => setIsLoadingMetaReview(false));
    }

    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
  }, [geneEntity, props.firebaseDb, props.firebaseInitSuccess]);

  useEffect(() => {
    if (metaReview) {
      const uuids = Object.keys(metaReview).reduce((acc, curr) => {
        if (metaReview[curr] === true) {
          // The legacy platform uses comma seperated string to denote that
          // a tumor needs review (requires both cancerTypes and excludedCancerTypes)
          acc = [...acc, ...curr.split(',').map(uuid => uuid.trim())];
        }
        return acc;
      }, []);
      setReviewUuids(uuids);
    }
  }, [metaReview]);

  useEffect(() => {
    if (geneData && !isLoadingMetaReview) {
      const reviewMap = new EditorReviewMap();
      const reviews = findReviews(props.drugList, geneData, reviewUuids, reviewMap);
      Object.keys(reviews.children).forEach(key => (reviews.children[key] = getCompactReviewInfo(reviews.children[key])));
      setEditorReviewMap(reviewMap);
      setRootReview(reviews);
      setIsReviewFinished(!reviews.hasChildren());
    }
  }, [geneData, reviewUuids]);

  const acceptAllChangesFromEditors = (editors: string[]) => {
    let reviewLevels = [] as ReviewLevel[];
    for (const editor of editors) {
      reviewLevels = reviewLevels.concat(editorReviewMap.getReviewsByEditor(editor));
    }
    props.acceptReviewChangeHandler(hugoSymbol, reviewLevels, isGermline);
  };

  return props.firebaseInitSuccess && !props.loadingGenes && props.drugList.length > 0 && !!geneEntity ? (
    <>
      <GeneHeader
        hugoSymbol={hugoSymbol}
        firebaseGenePath={firebaseGenePath}
        geneEntity={geneEntity}
        isGermline={isGermline}
        isReviewFinished={isReviewFinished}
        isReviewing={true}
      />
      <Row className={`${getSectionClassName()} justify-content-between`}>
        <Col>
          {isReviewFinished ? (
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
      {!isReviewFinished && (
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
                className="me-2 mb-2"
                outline
                color="primary"
                size="sm"
                onClick={() => acceptAllChangesFromEditors(editorReviewMap.getEditorList())}
              >
                Accept all changes
              </Button>
              {editorReviewMap.getEditorList().map(editor => (
                <Button
                  className="me-2 mb-2"
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

      {rootReview ? (
        <Row>
          <Col>
            {Object.values(rootReview.children)
              .sort(reviewLevelSortMethod)
              .map(reviewLevel => (
                <ReviewCollapsible
                  splitView={splitView}
                  hugoSymbol={hugoSymbol}
                  isGermline={isGermline}
                  key={reviewLevel.valuePath}
                  baseReviewLevel={reviewLevel}
                  handleAccept={props.acceptReviewChangeHandler}
                  handleDelete={props.rejectReviewChangeHandler}
                />
              ))}
          </Col>
        </Row>
      ) : undefined}
    </>
  ) : (
    <LoadingIndicator key={'curation-review-page-loading'} size={LoaderSize.LARGE} center isLoading />
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneReviewService, authStore, drugStore, geneStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  fullName: authStore.fullName,
  rejectReviewChangeHandler: firebaseGeneReviewService.rejectChanges,
  acceptReviewChangeHandler: firebaseGeneReviewService.acceptChanges,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
  searchGeneEntities: geneStore.searchEntities,
  geneEntities: geneStore.entities,
  loadingGenes: geneStore.loading,
  firebaseInitSuccess: firebaseAppStore.firebaseInitSuccess,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ReviewPage));
