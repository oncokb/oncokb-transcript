import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { createStores } from 'app/stores';
import { createBrowserHistory } from 'history';

import setupAxiosInterceptors from './config/axios-interceptor';
import ErrorBoundary from './shared/error/error-boundary';
import AppComponent from './app';
import { loadIcons } from './config/icon-loader';
import { AppConfig } from './appConfig';
import * as Sentry from '@sentry/react';

if (AppConfig.serverConfig?.frontend?.sentryDsn) {
  Sentry.init({
    // Adjust tracesSampleRate for production.
    // For more information, please see https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#tracing-options
    dsn: AppConfig.serverConfig.frontend.sentryDsn,
    integrations: [new Sentry.Replay()],
    environment: 'production',
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      // the following errors are for this project only
      'ResizeObserver loop limit exceeded',
      'Request has been terminated',
      'Failed to fetch all transcripts',
      'Non-Error promise rejection captured',

      // the following are suggested ignores by the community coming from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Generic error code from errors outside the security sandbox
      // You can delete this if using raven.js > 1.0, which ignores these automatically.
      'Script error.',
      // Avast extension error
      '_avast_submit',
    ],
    // Skip the common browser extension ad 3rd party script. List from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
    denyUrls: [
      new RegExp('.*localhost.*'),
      // Google Adsense
      /pagead\/js/i,
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],
  });
}

const browserHistory = createBrowserHistory();
const mobxStores = createStores(browserHistory);

setupAxiosInterceptors(() => mobxStores.authStore.clearAuthentication('login.error.unauthorized'));

loadIcons();

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
