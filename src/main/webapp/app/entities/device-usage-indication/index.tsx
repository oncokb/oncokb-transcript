import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import DeviceUsageIndication from './device-usage-indication';
import DeviceUsageIndicationDetail from './device-usage-indication-detail';
import DeviceUsageIndicationUpdate from './device-usage-indication-update';
import DeviceUsageIndicationDeleteDialog from './device-usage-indication-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={DeviceUsageIndicationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={DeviceUsageIndicationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={DeviceUsageIndicationDetail} />
      <ErrorBoundaryRoute path={match.url} component={DeviceUsageIndication} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={DeviceUsageIndicationDeleteDialog} />
  </>
);

export default Routes;
