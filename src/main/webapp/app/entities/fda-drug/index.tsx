import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import FdaDrug from './fda-drug';
import FdaDrugDetail from './fda-drug-detail';
import FdaDrugUpdate from './fda-drug-update';
import FdaDrugDeleteDialog from './fda-drug-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={FdaDrugUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={FdaDrugUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={FdaDrugDetail} />
      <ErrorBoundaryRoute path={match.url} component={FdaDrug} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={FdaDrugDeleteDialog} />
  </>
);

export default Routes;
