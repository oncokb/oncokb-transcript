import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import VariantConsequence from './variant-consequence';
import VariantConsequenceDetail from './variant-consequence-detail';
import VariantConsequenceUpdate from './variant-consequence-update';
import VariantConsequenceDeleteDialog from './variant-consequence-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={VariantConsequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={VariantConsequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={VariantConsequenceDetail} />
      <ErrorBoundaryRoute path={match.url} component={VariantConsequence} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={VariantConsequenceDeleteDialog} />
  </>
);

export default Routes;
