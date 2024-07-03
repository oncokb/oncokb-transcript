import React from 'react';
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

const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ '../pages/account/SettingsPage'),
  loading: () => <div>loading ...</div>,
});

const Admin = Loadable({
  loader: () => import(/* webpackChunkName: "administration" */ 'app/modules/administration'),
  loading: () => <div>loading ...</div>,
});

export type IRoutesProps = {
  isCurator: boolean;
};

const Routes: React.FunctionComponent<IRoutesProps> = (props: IRoutesProps) => {
  return (
    <div className="view-routes">
      <Switch>
        {props.isCurator ? (
          <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.CURATION} />
        ) : (
          <Redirect exact from={PAGE_ROUTE.HOME} to={PAGE_ROUTE.SEARCH} />
        )}
        <PageContainer>
          <Switch>
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

export default Routes;
