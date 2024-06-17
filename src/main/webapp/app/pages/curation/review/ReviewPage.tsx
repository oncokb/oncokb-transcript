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
import { Alert, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { RouteComponentProps } from 'react-router-dom';
import { useMatchGeneEntity } from 'app/hooks/useMatchGeneEntity';
import { GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import GeneHeader from '../header/GeneHeader';
import _ from 'lodash';
import { ReviewCollapsible } from '../collapsible/ReviewCollapsible';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';

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

  const [isReviewFinished, setIsReviewFinished] = useState(false);

  const [reviewUuids, setReviewUuids] = useState<string[]>(null);
  const [rootReview, setRootReview] = useState<BaseReviewLevel>(null);
  const [editorReviewMap, setEditorReviewMap] = useState(new EditorReviewMap());
  const [editorsToAcceptChangesFrom, setEditorsToAcceptChangesFrom] = useState<string[]>([]);
  const [isAcceptingAll, setIsAcceptingAll] = useState(false);
  const [splitView, setSplitView] = useState(false);

  const fetchFirebaseData = () => {
    // Fetch the data when the user enters review mode. We don't use a listener
    // because there shouldn't be another user editing the gene when it is being reviewed.
    get(ref(props.firebaseDb, firebaseGenePath)).then(snapshot => setGeneData(snapshot.val()));
    get(ref(props.firebaseDb, firebaseMetaReviewPath)).then(snapshot => setMetaReview(snapshot.val()));
  };

  useEffect(() => {
    if (geneEntity && props.firebaseInitSuccess) {
      fetchFirebaseData();
    }
  }, [geneEntity, props.firebaseDb, props.firebaseInitSuccess]);

  useEffect(() => {
    props.getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
  }, []);

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
    if (geneData && !_.isNil(reviewUuids)) {
      const reviewMap = new EditorReviewMap();
      const reviews = findReviews(props.drugList, geneData, _.clone(reviewUuids), reviewMap);
      Object.keys(reviews.children).forEach(key => (reviews.children[key] = getCompactReviewInfo(reviews.children[key])));
      setEditorReviewMap(reviewMap);
      setRootReview(reviews);
      setIsReviewFinished(!reviews.hasChildren());
    }
    if (reviewUuids?.length === 0) {
      setIsReviewFinished(true);
    }
  }, [geneData, reviewUuids, props.drugList]);

  const acceptAllChangesFromEditors = async (editors: string[]) => {
    let reviewLevels = [] as ReviewLevel[];
    for (const editor of editors) {
      reviewLevels = reviewLevels.concat(editorReviewMap.getReviewsByEditor(editor));
    }
    try {
      setIsAcceptingAll(true);
      await props.acceptReviewChangeHandler(hugoSymbol, reviewLevels, isGermline, true);
      fetchFirebaseData();
    } catch (error) {
      notifyError(error);
    } finally {
      setIsAcceptingAll(false);
      setEditorsToAcceptChangesFrom([]);
    }
  };

  const allEditors = editorReviewMap.getEditorList();

  return props.firebaseInitSuccess && !props.loadingGenes && props.drugList.length > 0 && !!geneEntity ? (
    <div data-testid="review-page">
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
              <AsyncSaveButton
                className="me-2 mb-2"
                outline
                color="primary"
                size="sm"
                onClick={() => {
                  setEditorsToAcceptChangesFrom(allEditors);
                  acceptAllChangesFromEditors(allEditors);
                }}
                disabled={isAcceptingAll}
                confirmText="Accept all changes"
                isSavePending={_.isEqual(allEditors, editorsToAcceptChangesFrom)}
              />
              {editorReviewMap.getEditorList().map(editor => (
                <AsyncSaveButton
                  className="me-2 mb-2"
                  key={editor}
                  outline
                  color="primary"
                  size="sm"
                  onClick={() => {
                    setEditorsToAcceptChangesFrom([editor]);
                    acceptAllChangesFromEditors([editor]);
                  }}
                  disabled={isAcceptingAll}
                  confirmText={`Accept all changes from ${editor}`}
                  isSavePending={_.isEqual([editor], editorsToAcceptChangesFrom)}
                />
              ))}
            </Col>
          </Row>
        </>
      )}
      {rootReview ? (
        <Row>
          <Col>
            <ReviewCollapsible
              splitView={splitView}
              hugoSymbol={hugoSymbol}
              isGermline={isGermline}
              baseReviewLevel={rootReview}
              handleAccept={props.acceptReviewChangeHandler}
              handleReject={props.rejectReviewChangeHandler}
              handleCreateAction={props.createActionHandler}
              disableActions={isAcceptingAll}
              isRoot={true}
              rootDelete={isPending => {
                if (isPending) {
                  setRootReview(_.cloneDeep(rootReview));
                } else {
                  setRootReview(null);
                  setIsReviewFinished(true);
                }
              }}
            />
          </Col>
        </Row>
      ) : undefined}
    </div>
  ) : (
    <LoadingIndicator key={'curation-review-page-loading'} size={LoaderSize.LARGE} center isLoading />
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneReviewService, authStore, drugStore, geneStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  fullName: authStore.fullName,
  acceptReviewChangeHandler: firebaseGeneReviewService.acceptChanges,
  rejectReviewChangeHandler: firebaseGeneReviewService.rejectChanges,
  createActionHandler: firebaseGeneReviewService.handleCreateAction,
  drugList: drugStore.entities,
  getDrugs: drugStore.getEntities,
  searchGeneEntities: geneStore.searchEntities,
  geneEntities: geneStore.entities,
  loadingGenes: geneStore.loading,
  firebaseInitSuccess: firebaseAppStore.firebaseInitSuccess,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ReviewPage));
