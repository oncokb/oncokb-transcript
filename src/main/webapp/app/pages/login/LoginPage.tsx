import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Redirect, useHistory } from 'react-router-dom';
import { IRootStore } from 'app/stores';
import { PAGE_ROUTE } from 'app/config/constants/constants';
import axios from 'axios';

interface ILoginProps extends StoreProps {}

const Login = ({ isAuthenticated, fetchingsession, initialPageLoadUrl }: ILoginProps) => {
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push(initialPageLoadUrl ?? PAGE_ROUTE.HOME);
    } else if (!fetchingsession) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, history, initialPageLoadUrl, fetchingsession]);

  return <></>;
};

const mapStoreToProps = ({ authStore, routerStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  fetchingsession: authStore.fetchingSession,
  initialPageLoadUrl: routerStore.initialPageLoadUrl,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Login);
