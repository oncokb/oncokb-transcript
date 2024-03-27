import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import SpecimenType from './specimen-type';
import SpecimenTypeDetail from './specimen-type-detail';
import SpecimenTypeUpdate from './specimen-type-update';
import SpecimenTypeDeleteDialog from './specimen-type-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SpecimenTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SpecimenTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SpecimenTypeDetail} />
      <ErrorBoundaryRoute path={match.url} component={SpecimenType} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={SpecimenTypeDeleteDialog} />
  </>
);

export default Routes;
