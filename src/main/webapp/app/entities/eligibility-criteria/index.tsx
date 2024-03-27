import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import EligibilityCriteria from './eligibility-criteria';
import EligibilityCriteriaDetail from './eligibility-criteria-detail';
import EligibilityCriteriaUpdate from './eligibility-criteria-update';
import EligibilityCriteriaDeleteDialog from './eligibility-criteria-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={EligibilityCriteriaUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={EligibilityCriteriaUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={EligibilityCriteriaDetail} />
      <ErrorBoundaryRoute path={match.url} component={EligibilityCriteria} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={EligibilityCriteriaDeleteDialog} />
  </>
);

export default Routes;
