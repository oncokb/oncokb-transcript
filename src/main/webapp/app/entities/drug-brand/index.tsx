import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import DrugBrand from './drug-brand';
import DrugBrandDetail from './drug-brand-detail';
import DrugBrandUpdate from './drug-brand-update';
import DrugBrandDeleteDialog from './drug-brand-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={DrugBrandUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={DrugBrandUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={DrugBrandDetail} />
      <ErrorBoundaryRoute path={match.url} component={DrugBrand} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={DrugBrandDeleteDialog} />
  </>
);

export default Routes;
