import React, { useEffect, useMemo } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Link, RouteComponentProps } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants/constants';

export interface ILogoutProps extends StoreProps, RouteComponentProps {
  logoutUrl: string;
}

export const Logout = (props: ILogoutProps) => {
  const sessionTerminated = useMemo(() => {
    const searchParams = new URLSearchParams(props.location.search);
    return !!searchParams.get('session_terminated');
  }, [props.location.search]);

  const unauthorizedAccess = useMemo(() => {
    const searchParams = new URLSearchParams(props.location.search);
    return !!searchParams.get('unauthorized');
  }, [props.location.search]);

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
        let updatedLogoutUrl = `${props.logoutUrl}&post_logout_redirect_uri=`;
        let redirectUrl = window.location.href;
        if (!unauthorizedAccess) {
          redirectUrl += '?session_terminated=true';
        } else {
          redirectUrl += '&session_terminated=true';
        }
        updatedLogoutUrl += encodeURIComponent(redirectUrl);
        window.location.href = updatedLogoutUrl;
      }
    }
  }, [props.logoutUrl, sessionTerminated, unauthorizedAccess]);

  if (!sessionTerminated) {
    return <></>;
  }

  if (unauthorizedAccess && !sessionTerminated) {
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

export default connect(mapStoreToProps)(Logout);
