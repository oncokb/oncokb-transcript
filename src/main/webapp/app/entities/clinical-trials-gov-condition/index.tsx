import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import ClinicalTrialsGovCondition from './clinical-trials-gov-condition';
import ClinicalTrialsGovConditionDetail from './clinical-trials-gov-condition-detail';
import ClinicalTrialsGovConditionUpdate from './clinical-trials-gov-condition-update';
import ClinicalTrialsGovConditionDeleteDialog from './clinical-trials-gov-condition-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ClinicalTrialsGovConditionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ClinicalTrialsGovConditionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ClinicalTrialsGovConditionDetail} />
      <ErrorBoundaryRoute path={match.url} component={ClinicalTrialsGovCondition} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ClinicalTrialsGovConditionDeleteDialog} />
  </>
);

export default Routes;
