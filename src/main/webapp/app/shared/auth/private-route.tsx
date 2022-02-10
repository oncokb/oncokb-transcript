import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Route, Redirect, RouteProps } from 'react-router-dom';

import { IRootStore } from 'app/stores';
import ErrorBoundary from 'app/shared/error/error-boundary';
import { PAGE_ROUTE } from 'app/config/constants';

interface IOwnProps extends RouteProps {
  hasAnyAuthorities?: string[];
}

export interface IPrivateRouteProps extends IOwnProps, StoreProps {}

export const PrivateRouteComponent = ({
  component: Component,
  isAuthenticated,
  sessionHasBeenFetched,
  account,
  hasAnyAuthorities = [],
  ...rest
}: IPrivateRouteProps) => {
  const isAuthorized = hasAnyAuthority(account.authorities, hasAnyAuthorities);

  /* eslint-disable no-console */
  const checkAuthorities = props =>
    isAuthorized ? (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    ) : (
      <div className="insufficient-authority">
        <div className="alert alert-danger">You are not authorized to access this page.</div>
      </div>
    );

  const renderRedirect = props => {
    return isAuthenticated ? (
      checkAuthorities(props)
    ) : (
      <Redirect
        to={{
          pathname: PAGE_ROUTE.LOGIN,
          search: props.location.search,
          state: { from: props.location },
        }}
      />
    );
  };

  if (!Component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};

const mapStoreToProps = ({ authStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  account: authStore.account,
  sessionHasBeenFetched: authStore.sessionHasBeenFetched,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

/**
 * A route wrapped in an authentication check so that routing happens only when you are authenticated.
 * Accepts same props as React router Route.
 * The route also checks for authorization if hasAnyAuthorities is specified.
 */
export const PrivateRoute = connect(mapStoreToProps)(PrivateRouteComponent);

export default PrivateRoute;
