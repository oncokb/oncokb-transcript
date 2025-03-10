import { AUTHORITIES, GERMLINE_PATH, PAGE_ROUTE, SOMATIC_GERMLINE_SETTING_KEY, SOMATIC_PATH } from 'app/config/constants/constants';
import CurationPage from 'app/pages/curation/CurationPage';
import GeneListPage from 'app/pages/curation/GeneListPage';
import ReviewPage from 'app/pages/curation/review/ReviewPage';
import PrivateRoute from 'app/shared/auth/private-route';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';

const CurationRoutes = ({ location }: StoreProps) => {
  let isGermline = location?.pathname.includes(GERMLINE_PATH);
  let isSomatic = location?.pathname.includes(SOMATIC_PATH);

  const storageKey = SOMATIC_GERMLINE_SETTING_KEY;

  if (!isGermline && !isSomatic) {
    isGermline = localStorage.getItem(storageKey) === GERMLINE_PATH;
    isSomatic = localStorage.getItem(storageKey) === SOMATIC_PATH;
  } else {
    localStorage.setItem(storageKey, isGermline ? GERMLINE_PATH : SOMATIC_PATH);
  }

  /* eslint-disable no-console */
  console.log('Location changed: ', location, ' is germline: ', isGermline);

  return (
    <Switch location={location}>
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

const mapStoreToProps = ({ routerStore }: IRootStore) => ({
  location: routerStore.location,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CurationRoutes));
