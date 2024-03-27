import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import ClinicalTrialArm from './clinical-trial-arm';
import ClinicalTrialArmDetail from './clinical-trial-arm-detail';
import ClinicalTrialArmUpdate from './clinical-trial-arm-update';
import ClinicalTrialArmDeleteDialog from './clinical-trial-arm-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ClinicalTrialArmUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ClinicalTrialArmUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ClinicalTrialArmDetail} />
      <ErrorBoundaryRoute path={match.url} component={ClinicalTrialArm} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ClinicalTrialArmDeleteDialog} />
  </>
);

export default Routes;
