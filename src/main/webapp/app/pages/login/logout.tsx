import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  KEYCLOAK_LOGOUT_REDIRECT_PARAM,
  KEYCLOAK_SESSION_TERMINATED_PARAM,
  KEYCLOAK_UNAUTHORIZED_PARAM,
  PAGE_ROUTE,
} from 'app/config/constants/constants';
import { setUrlParams } from 'app/shared/util/url-utils';

function getKeycloakLogoutUrl(baseLogoutUrl: string) {
  const redirectUrl = setUrlParams(window.location.href, { [KEYCLOAK_SESSION_TERMINATED_PARAM]: true });
  // Encoding URI will allow us to include multiple search params in redirect uri param
  const keyCloakLogoutUrl = setUrlParams(baseLogoutUrl, { [KEYCLOAK_LOGOUT_REDIRECT_PARAM]: redirectUrl });
  return keyCloakLogoutUrl;
}

export interface ILogoutProps extends StoreProps, RouteComponentProps {
  logoutUrl: string | null;
}

export const Logout = (props: ILogoutProps) => {
  const searchParams = new URLSearchParams(props.location.search);

  const sessionTerminated = !!searchParams.get(KEYCLOAK_SESSION_TERMINATED_PARAM);
  const unauthorizedAccess = !!searchParams.get(KEYCLOAK_UNAUTHORIZED_PARAM);

  useEffect(() => {
    if (unauthorizedAccess && !sessionTerminated) {
      props.logout();
    } else if (!sessionTerminated) {
      props.logout();
    }
  }, [unauthorizedAccess, sessionTerminated]);

  useEffect(() => {
    if (props.logoutUrl) {
      if (!sessionTerminated || unauthorizedAccess) {
        window.location.href = getKeycloakLogoutUrl(props.logoutUrl);
      }
    }
  }, [props.logoutUrl, sessionTerminated, unauthorizedAccess]);

  if (!sessionTerminated) {
    return <></>;
  }

  if (unauthorizedAccess) {
    return <></>;
  }

  const unauthorizedAccessContent = (
    <>
      <h3 className="card-title mb-4">Logged out!</h3>
      <div className="card-text alert alert-danger" role="alert">
        You are not authorized to access this website. If you think this is an error, please reach out to OncoKB Dev team.
      </div>
    </>
  );

  const loggedOutContent = (
    <>
      <h3 className="card-title mb-4">Logged out successfully!</h3>
    </>
  );

  return (
    <div className="d-flex justify-content-center">
      <div className="card" style={{ width: '40rem' }}>
        <div className="card-body">
          {unauthorizedAccess ? unauthorizedAccessContent : loggedOutContent}
          <p className="card-text">Please click on &apos;Sign in&apos; to be directed to the login page.</p>
          <Link to={PAGE_ROUTE.LOGIN} className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  isAuthenticated: storeState.authStore.isAuthenticated,
  logoutUrl: storeState.authStore.logoutUrl,
  logout: storeState.authStore.logout,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<ILogoutProps, StoreProps>(mapStoreToProps)(Logout);
