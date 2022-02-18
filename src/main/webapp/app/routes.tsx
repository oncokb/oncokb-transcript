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
        <PrivateRoute exact path={PAGE_ROUTE.ARTICLES_SEARCH} component={ArticleSearchPage} />
        <PrivateRoute exact path={PAGE_ROUTE.ARTICLE} component={ArticlePage} />
        <PrivateRoute exact path={PAGE_ROUTE.GENE} component={GenePage} />
        <PrivateRoute path="/account" component={Account} hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]} />
        <ErrorBoundaryRoute exact component={PageNotFound} />
      </Switch>
    </div>
  );
};

export default Routes;
