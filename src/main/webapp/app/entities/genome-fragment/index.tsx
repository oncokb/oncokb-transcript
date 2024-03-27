import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import GenomeFragment from './genome-fragment';
import GenomeFragmentDetail from './genome-fragment-detail';
import GenomeFragmentUpdate from './genome-fragment-update';
import GenomeFragmentDeleteDialog from './genome-fragment-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={GenomeFragmentUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={GenomeFragmentUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={GenomeFragmentDetail} />
      <ErrorBoundaryRoute path={match.url} component={GenomeFragment} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={GenomeFragmentDeleteDialog} />
  </>
);

export default Routes;
