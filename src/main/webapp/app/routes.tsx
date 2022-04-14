import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import Login from 'app/pages/login/LoginPage';
import Logout from 'app/pages/login/logout';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import PageNotFound from 'app/shared/error/page-not-found';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants';
import SearchPage from './pages/SearchPage';
import LoginRedirect from './pages/login/login-redirect';
import UserManagementPage from './pages/UserManagementPage';
import Entities from 'app/entities';
import PageContainer from './components/PageContainer';

const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ './pages/account/SettingsPage'),
  loading: () => <div>loading ...</div>,
});

const Routes = () => {
  return (
    <div className="view-routes">
      <Switch>
        <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.SEARCH} />
        <PageContainer>
          <Switch>
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGIN} component={Login} />
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGOUT} component={Logout} />
            <ErrorBoundaryRoute exact path={PAGE_ROUTE.OAUTH} component={LoginRedirect} />
            <PrivateRoute exact path={PAGE_ROUTE.SEARCH} component={SearchPage} />
            <PrivateRoute path="/" component={Entities} hasAnyAuthorities={[AUTHORITIES.USER]} />
            <PrivateRoute exact path={PAGE_ROUTE.ACCOUNT} component={Account} hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]} />
            <PrivateRoute
              exact
              path={PAGE_ROUTE.ADMIN_USER_MANAGEMENT}
              component={UserManagementPage}
              hasAnyAuthorities={[AUTHORITIES.ADMIN]}
            />
            <ErrorBoundaryRoute exact component={PageNotFound} />
          </Switch>
        </PageContainer>
      </Switch>
    </div>
  );
};

export default Routes;
