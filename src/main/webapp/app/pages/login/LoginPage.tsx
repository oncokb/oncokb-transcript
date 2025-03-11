import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Redirect, useHistory } from 'react-router-dom';
import { IRootStore } from 'app/stores';
import { PAGE_ROUTE } from 'app/config/constants/constants';

export interface ILoginProps extends StoreProps {}

export const Login = ({ isAuthenticated, fetchingsession, initialPageLoadUrl }: ILoginProps) => {
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push(initialPageLoadUrl ?? PAGE_ROUTE.HOME);
    }
  }, [isAuthenticated, history, initialPageLoadUrl]);

  if (!fetchingsession) {
    return <Redirect to={PAGE_ROUTE.OAUTH} />;
  }
  return <></>;
};

const mapStoreToProps = ({ authStore, routerStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  fetchingsession: authStore.fetchingSession,
  initialPageLoadUrl: routerStore.initialPageLoadUrl,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Login);
