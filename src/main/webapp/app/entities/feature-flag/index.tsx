import React from 'react';
import { Switch } from 'react-router-dom';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import FeatureFlag from './feature-flag';
import FeatureFlagDetail from './feature-flag-detail';
import FeatureFlagUpdate from './feature-flag-update';
import FeatureFlagDeleteDialog from './feature-flag-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={FeatureFlagUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={FeatureFlagUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={FeatureFlagDetail} />
      <ErrorBoundaryRoute path={match.url} component={FeatureFlag} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={FeatureFlagDeleteDialog} />
  </>
);

export default Routes;
