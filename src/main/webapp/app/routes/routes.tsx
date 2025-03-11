import React, { useEffect } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import Login from 'app/pages/login/LoginPage';
import Logout from 'app/pages/login/logout';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import PageNotFound from 'app/shared/error/page-not-found';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants/constants';
import SearchPage from '../pages/SearchPage';
import LoginRedirect from '../pages/login/login-redirect';
import Entities from 'app/entities';
import PageContainer from '../components/PageContainer';
import CurationRoutes from './curation-routes';
import { hasAnyAuthority, IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { componentInject } from 'app/shared/util/typed-inject';

const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ '../pages/account/SettingsPage'),
  loading: () => <div>loading ...</div>,
});

const Admin = Loadable({
  loader: () => import(/* webpackChunkName: "administration" */ 'app/modules/administration'),
  loading: () => <div>loading ...</div>,
});

const Routes = ({ location, isCurator, setInitialPageLoadUrl }: StoreProps) => {
  useEffect(() => {
    setInitialPageLoadUrl?.(location?.pathname ?? '');
  }, []);
  return (
    <div className="view-routes">
      <Switch location={location}>
        {isCurator ? (
          <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.CURATION} />
        ) : (
          <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.SEARCH} />
        )}
        <PageContainer>
          <Switch location={location}>
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGIN} component={Login} />
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGOUT} component={Logout} />
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.OAUTH} component={LoginRedirect} />
            <PrivateRoute exact path={PAGE_ROUTE.SEARCH} component={SearchPage} />
            <PrivateRoute path={PAGE_ROUTE.CURATION} component={CurationRoutes} hasAnyAuthorities={[AUTHORITIES.CURATOR]} />
            <PrivateRoute exact path={PAGE_ROUTE.ACCOUNT} component={Account} hasAnyAuthorities={[AUTHORITIES.USER]} />
            <PrivateRoute path="/admin" component={Admin} hasAnyAuthorities={[AUTHORITIES.ADMIN]} />
            <PrivateRoute path="/" component={Entities} hasAnyAuthorities={[AUTHORITIES.USER]} />
            <ErrorBoundaryRoute exact component={PageNotFound} />
          </Switch>
        </PageContainer>
      </Switch>
    </div>
  );
};

const mapStoreToProps = ({ routerStore, authStore }: IRootStore) => ({
  location: routerStore.location,
  isCurator: hasAnyAuthority(authStore.account.authorities ?? [], [AUTHORITIES.CURATOR]),
  setInitialPageLoadUrl: routerStore.setInitialPageLoadUrl,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(Routes));
