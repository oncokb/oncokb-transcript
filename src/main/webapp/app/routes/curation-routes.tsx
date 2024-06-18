import { AUTHORITIES, GERMLINE_PATH, PAGE_ROUTE, SOMATIC_GERMLINE_SETTING_KEY, SOMATIC_PATH } from 'app/config/constants/constants';
import CurationPage from 'app/pages/curation/CurationPage';
import GeneListPage from 'app/pages/curation/GeneListPage';
import ReviewPage from 'app/pages/curation/review/ReviewPage';
import PrivateRoute from 'app/shared/auth/private-route';
import React from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';

const CurationRoutes = () => {
  const { pathname } = useLocation();
  let isGermline = pathname.includes(GERMLINE_PATH);
  let isSomatic = pathname.includes(SOMATIC_PATH);

  const storageKey = SOMATIC_GERMLINE_SETTING_KEY;

  if (!isGermline && !isSomatic) {
    isGermline = localStorage.getItem(storageKey) === GERMLINE_PATH;
    isSomatic = localStorage.getItem(storageKey) === SOMATIC_PATH;
  } else {
    localStorage.setItem(storageKey, isGermline ? GERMLINE_PATH : SOMATIC_PATH);
  }

  return (
    <Switch>
      <PrivateRoute exact path={PAGE_ROUTE.CURATION_SOMATIC} component={GeneListPage} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
      <Redirect exact from={PAGE_ROUTE.CURATION} to={isGermline ? PAGE_ROUTE.CURATION_GERMLINE : PAGE_ROUTE.CURATION_SOMATIC} />
      <PrivateRoute exact path={PAGE_ROUTE.CURATION_GERMLINE} component={GeneListPage} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
      <PrivateRoute exact path={PAGE_ROUTE.CURATION_GENE_SOMATIC} component={CurationPage} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
      <Redirect
        exact
        from={PAGE_ROUTE.CURATION_GENE}
        to={isGermline ? PAGE_ROUTE.CURATION_GENE_GERMLINE : PAGE_ROUTE.CURATION_GENE_SOMATIC}
      />
      <PrivateRoute exact path={PAGE_ROUTE.CURATION_GENE_SOMATIC_REVIEW} component={ReviewPage} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
      <PrivateRoute exact path={PAGE_ROUTE.CURATION_GENE_GERMLINE} component={CurationPage} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
      <PrivateRoute
        exact
        path={PAGE_ROUTE.CURATION_GENE_GERMLINE_REVIEW}
        component={ReviewPage}
        hasAnyAuthorities={[AUTHORITIES.CURATOR]}
      />
    </Switch>
  );
};

export default CurationRoutes;
