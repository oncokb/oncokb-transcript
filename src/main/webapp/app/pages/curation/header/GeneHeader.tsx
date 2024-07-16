import { CBIOPORTAL, COSMIC, PAGE_ROUTE } from 'app/config/constants/constants';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import { HgncLink } from 'app/shared/links/HgncLink';
import { PubmedGeneLink } from 'app/shared/links/PubmedGeneLink';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import WithSeparator from 'react-with-separator';
import { InlineDivider } from 'app/shared/links/PubmedGeneArticlesLink';
import { onValue, ref } from 'firebase/database';
import { geneMetaReviewHasUuids, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { IGene } from 'app/shared/model/gene.model';
import { MetaReview } from 'app/shared/model/firebase/firebase.model';
import { Button, Col, Row } from 'reactstrap';
import CommentIcon from 'app/shared/icons/CommentIcon';
import SomaticGermlineToggleButton from '../button/SomaticGermlineToggleButton';
import { getCbioportalResultsPageMutationTabUrl } from 'app/shared/util/url-utils';
import { generatePath, useHistory } from 'react-router-dom';
import { GENE_HEADER_REVIEW_BUTTON_ID, GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID } from 'app/config/constants/html-id';

export interface IGeneHeaderProps extends StoreProps {
  hugoSymbol: string | undefined;
  firebaseGenePath: string;
  geneEntity: IGene | undefined;
  isReviewing?: boolean;
  isReviewFinished?: boolean;
  isGermline?: boolean;
}

const GeneHeader = ({
  hugoSymbol,
  updateCurrentReviewer,
  firebaseDb,
  firebaseGenePath,
  geneEntity,
  isReviewing,
  isReviewFinished,
  isGermline,
}: IGeneHeaderProps) => {
  const history = useHistory();
  const firebaseMetaPath = getFirebaseMetaGenePath(isGermline, hugoSymbol);
  const [metaReview, setMetaReview] = useState<MetaReview>();

  const reviewPageRoute = isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE_REVIEW : PAGE_ROUTE.CURATION_GENE_SOMATIC_REVIEW;
  const curationPageRoute = isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE : PAGE_ROUTE.CURATION_GENE_SOMATIC;

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const subscribe = onValue(ref(firebaseDb, `${firebaseMetaPath}/review`), snapshot => {
      setMetaReview(snapshot.val());
    });
    return () => subscribe?.();
  }, []);

  const handleReviewButtonClick = () => {
    updateCurrentReviewer?.(hugoSymbol ?? '', isGermline, !isReviewing);
    history.push(generatePath(isReviewing ? curationPageRoute : reviewPageRoute, { hugoSymbol: hugoSymbol ?? '' }));
  };

  const getReviewButton = () => {
    let button: JSX.Element;
    if (geneMetaReviewHasUuids(metaReview)) {
      if (isReviewing || isReviewFinished) {
        button = (
          <Button color="primary" onClick={handleReviewButtonClick} data-testid={GENE_HEADER_REVIEW_COMPLETE_BUTTON_ID}>
            Review Complete
          </Button>
        );
      } else {
        button = (
          <Button outline color="primary" onClick={handleReviewButtonClick} data-testid={GENE_HEADER_REVIEW_BUTTON_ID}>
            Review
          </Button>
        );
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

  const hideEntrezGeneId = hugoSymbol === 'Other Biomarkers';

  return (
    <Row className={'mb-2'}>
      <Col>
        <div style={{ width: '100%' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center mb-1">
              <span style={{ fontSize: '3rem', lineHeight: 1 }} className={'me-3'}>
                {hugoSymbol}
              </span>
              {!isReviewing && (
                <>
                  <CommentIcon id={`${hugoSymbol}_curation_page`} path={`${firebaseGenePath}/name_comments`} />
                  <div className="ms-3">
                    <SomaticGermlineToggleButton hugoSymbol={hugoSymbol} />
                  </div>
                </>
              )}
            </div>
            {getReviewButton()}
          </div>
          {!isReviewing && (
            <>
              <span>
                {!hideEntrezGeneId && geneEntity !== undefined && (
                  <span>
                    <span className="fw-bold text-nowrap">Entrez Gene:</span>
                    <span className="ms-1">
                      <PubmedGeneLink entrezGeneId={geneEntity.entrezGeneId} />
                    </span>
                  </span>
                )}
                {geneEntity?.hgncId && (
                  <span className="ms-2">
                    <span className="fw-bold">HGNC:</span>
                    <span className="ms-1">
                      <HgncLink id={geneEntity.hgncId} />
                    </span>
                  </span>
                )}
                {geneEntity?.synonyms && geneEntity.synonyms.length > 0 && (
                  <span className="ms-2">
                    <span className="fw-bold">Gene aliases:</span>
                    <span className="ms-1">
                      <WithSeparator separator={', '}>
                        {geneEntity.synonyms.map(synonym => (
                          <span className={'text-nowrap'} key={synonym.name}>
                            {synonym.name}
                          </span>
                        ))}
                      </WithSeparator>
                    </span>
                  </span>
                )}
                <span className="ms-2">
                  <span className="fw-bold me-2">External Links:</span>
                  <WithSeparator separator={InlineDivider}>
                    <a href={getCbioportalResultsPageMutationTabUrl(hugoSymbol ?? '')} target="_blank" rel="noopener noreferrer">
                      {CBIOPORTAL} <ExternalLinkIcon />
                    </a>
                    <a href={`http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=${hugoSymbol}`} target="_blank" rel="noopener noreferrer">
                      {COSMIC} <ExternalLinkIcon />
                    </a>
                  </WithSeparator>
                </span>
              </span>
            </>
          )}
        </div>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseMetaService, routerStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  updateCurrentReviewer: firebaseMetaService.updateGeneCurrentReviewer,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneHeader));
