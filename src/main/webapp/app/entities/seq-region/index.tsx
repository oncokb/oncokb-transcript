import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import SeqRegion from './seq-region';
import SeqRegionDetail from './seq-region-detail';
import SeqRegionUpdate from './seq-region-update';
import SeqRegionDeleteDialog from './seq-region-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SeqRegionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SeqRegionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SeqRegionDetail} />
      <ErrorBoundaryRoute path={match.url} component={SeqRegion} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={SeqRegionDeleteDialog} />
  </>
);

export default Routes;
