import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import CompanionDiagnosticDevice from './companion-diagnostic-device';
import CompanionDiagnosticDeviceDetail from './companion-diagnostic-device-detail';
import CompanionDiagnosticDeviceUpdate from './companion-diagnostic-device-update';
import CompanionDiagnosticDeviceDeleteDialog from './companion-diagnostic-device-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={CompanionDiagnosticDeviceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={CompanionDiagnosticDeviceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={CompanionDiagnosticDeviceDetail} />
      <ErrorBoundaryRoute path={match.url} component={CompanionDiagnosticDevice} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={CompanionDiagnosticDeviceDeleteDialog} />
  </>
);

export default Routes;
