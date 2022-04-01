import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import Login from 'app/pages/login/LoginPage';
import Logout from 'app/pages/login/logout';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import PageNotFound from 'app/shared/error/page-not-found';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants';
import ArticleSearchPage from './pages/ArticleSearchPage';
import ArticlePage from './pages/ArticlePage';
import GenePage from './pages/GenePage';
import LoginRedirect from './pages/login/login-redirect';
import UserManagementPage from './pages/UserManagementPage';
import Entities from 'app/entities';

const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ './pages/account/SettingsPage'),
  loading: () => <div>loading ...</div>,
});

const Routes = () => {
  return (
    <div className="view-routes">
      <Switch>
        <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.ARTICLES_SEARCH} />
        <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGIN} component={Login} />
        <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGOUT} component={Logout} />
        <ErrorBoundaryRoute exact path={PAGE_ROUTE.OAUTH} component={LoginRedirect} />
        <PrivateRoute exact path={PAGE_ROUTE.ARTICLES_SEARCH} component={ArticleSearchPage} />
        <PrivateRoute path="/" component={Entities} hasAnyAuthorities={[AUTHORITIES.USER]} />
        <PrivateRoute exact path={PAGE_ROUTE.GENE} component={GenePage} />
        <PrivateRoute exact path={PAGE_ROUTE.ACCOUNT} component={Account} hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]} />
        <PrivateRoute
          exact
          path={PAGE_ROUTE.ADMIN_USER_MANAGEMENT}
          component={UserManagementPage}
          hasAnyAuthorities={[AUTHORITIES.ADMIN]}
        />
        <ErrorBoundaryRoute exact component={PageNotFound} />
      </Switch>
    </div>
  );
};

export default Routes;
