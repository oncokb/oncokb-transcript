import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { Meta } from 'app/shared/model/firebase/firebase.model';
import { geneMetaReviewHasUuids, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { PAGE_ROUTE } from 'app/config/constants/constants';
import { Button } from 'reactstrap';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { SentryError } from 'app/config/sentry-error';
import { generatePath, useHistory } from 'react-router-dom';
import { GENE_HEADER_REVIEW_BUTTON_ID, GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID } from 'app/config/constants/html-id';
import { FaEye, FaPencil } from 'react-icons/fa6';
import TimeAgoText from 'app/shared/text/TimeAgoText';
import WithSeparator from 'react-with-separator';
import { InlineDivider } from 'app/shared/links/PubmedGeneArticlesLink';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';

export interface IGeneticTypeTabHeader extends StoreProps {
  hugoSymbol: string;
  isReviewing?: boolean;
  isReviewFinished?: boolean;
}

const GeneticTypeTabHeader = ({
  isGermline,
  hugoSymbol,
  isReviewing,
  isReviewFinished,
  firebaseDb,
  updateCurrentReviewer,
  fullName,
}: IGeneticTypeTabHeader) => {
  const history = useHistory();
  const firebaseMetaPath = getFirebaseMetaGenePath(isGermline, hugoSymbol);
  const [meta, setMeta] = useState<Meta>();

  const reviewPageRoute = isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE_REVIEW : PAGE_ROUTE.CURATION_GENE_SOMATIC_REVIEW;
  const curationPageRoute = isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE : PAGE_ROUTE.CURATION_GENE_SOMATIC;

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const subscribe = onValue(ref(firebaseDb, firebaseMetaPath), snapshot => {
      setMeta(snapshot.val());
    });
    return () => subscribe?.();
  }, []);

  const handleReviewButtonClick = () => {
    if (hugoSymbol === undefined) {
      notifyError(new SentryError('hugoSymbol is undefined', {}));
      return;
    }
    updateCurrentReviewer?.(hugoSymbol, !!isGermline, !!isReviewing);
    history.push(generatePath(isReviewing ? curationPageRoute : reviewPageRoute, { hugoSymbol }));
  };

  const getReviewButton = () => {
    let button: JSX.Element;
    if (geneMetaReviewHasUuids(meta?.review)) {
      if (isReviewing || isReviewFinished) {
        button = (
          <Button color="primary" onClick={handleReviewButtonClick} data-testid={GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID}>
            Review Complete
          </Button>
        );
      } else {
        const isAnotherUserReviewing =
          meta?.review?.currentReviewer !== '' && meta?.review?.currentReviewer.toLowerCase() !== fullName?.toLowerCase();
        button = (
          <Button
            outline
            color={isAnotherUserReviewing ? 'warning' : 'primary'}
            onClick={handleReviewButtonClick}
            data-testid={GENE_HEADER_REVIEW_BUTTON_ID}
          >
            Review
          </Button>
        );
        if (isAnotherUserReviewing) {
          button = (
            <DefaultTooltip
              mouseEnterDelay={0}
              placement="top"
              overlay={<div>Another user is currently in review mode. If you proceed, they will be forced out of review mode.</div>}
            >
              {button}
            </DefaultTooltip>
          );
        }
      }
    } else {
      if (isReviewFinished) {
        button = (
          <Button color="primary" onClick={handleReviewButtonClick} data-testid={GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID}>
            Review Complete
          </Button>
        );
      } else {
        return undefined;
      }
    }
    return <>{button}</>;
  };

  return (
    <div className="d-flex align-items-center">
      {!isReviewing && (
        <WithSeparator separator={InlineDivider}>
          {meta?.lastModifiedAt && meta?.lastModifiedBy ? (
            <div className="me-4 text-muted d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
              <FaPencil size={12} className="me-1" />{' '}
              <div>
                Last edit made by {meta?.lastModifiedBy} <TimeAgoText date={new Date(parseInt(meta.lastModifiedAt, 10))} />
              </div>
            </div>
          ) : undefined}
          {meta?.review?.currentReviewer ? (
            <div className="me-4 d-flex align-items-center text-danger" style={{ fontSize: '0.9rem' }}>
              <FaEye size={12} className="me-1" /> <div>{meta.review.currentReviewer} is currently reviewing</div>
            </div>
          ) : undefined}
        </WithSeparator>
      )}
      {getReviewButton()}
    </div>
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneService, firebaseMetaService, authStore, routerStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  createGene: firebaseGeneService.createGene,
  updateCurrentReviewer: firebaseMetaService.updateGeneCurrentReviewer,
  fullName: authStore.fullName,
  isGermline: routerStore.isGermline,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneticTypeTabHeader));
