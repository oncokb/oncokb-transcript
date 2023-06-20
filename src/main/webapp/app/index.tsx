import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { createStores } from 'app/stores';
import { createBrowserHistory } from 'history';

import setupAxiosInterceptors from './config/axios-interceptor';
import ErrorBoundary from './shared/error/error-boundary';
import AppComponent from './app';
import { loadIcons } from './config/icon-loader';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeFirebase } from './shared/firebase/firebase-utils';

const browserHistory = createBrowserHistory();
const mobxStores = createStores(browserHistory);

setupAxiosInterceptors(() => mobxStores.authStore.clearAuthentication('login.error.unauthorized'));

loadIcons();

// Initialize Firebase
export const firebaseApp = initializeFirebase();
export const firebaseDB = getDatabase(firebaseApp);

const rootEl = document.getElementById('root');

const render = Component =>
  // eslint-disable-next-line react/no-render-return-value
  ReactDOM.render(
    <ErrorBoundary>
      <Provider {...mobxStores}>
        <Component />
      </Provider>
    </ErrorBoundary>,
    rootEl
  );

render(AppComponent);
