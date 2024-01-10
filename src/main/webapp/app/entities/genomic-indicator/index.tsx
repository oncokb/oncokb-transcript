import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import GenomicIndicator from './genomic-indicator';
import GenomicIndicatorDetail from './genomic-indicator-detail';
import GenomicIndicatorUpdate from './genomic-indicator-update';
import GenomicIndicatorDeleteDialog from './genomic-indicator-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={GenomicIndicatorUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={GenomicIndicatorUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={GenomicIndicatorDetail} />
      <ErrorBoundaryRoute path={match.url} component={GenomicIndicator} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={GenomicIndicatorDeleteDialog} />
  </>
);

export default Routes;
