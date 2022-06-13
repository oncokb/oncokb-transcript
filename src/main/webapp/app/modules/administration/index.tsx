import React from 'react';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import UserManagement from './user-management';
import CacheManagement from './cache-management/cache-management';

const Routes = ({ match }) => (
  <div>
    <ErrorBoundaryRoute path={`${match.url}/user-management`} component={UserManagement} />
    <ErrorBoundaryRoute path={`${match.url}/cache-management`} component={CacheManagement} />
  </div>
);

export default Routes;
