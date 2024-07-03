import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import ClinicalTrial from './clinical-trial';
import ClinicalTrialDetail from './clinical-trial-detail';
import ClinicalTrialUpdate from './clinical-trial-update';
import ClinicalTrialDeleteDialog from './clinical-trial-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ClinicalTrialUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ClinicalTrialUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ClinicalTrialDetail} />
      <ErrorBoundaryRoute path={match.url} component={ClinicalTrial} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ClinicalTrialDeleteDialog} />
  </>
);

export default Routes;
