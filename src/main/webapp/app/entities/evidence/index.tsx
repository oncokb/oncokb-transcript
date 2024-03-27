import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Evidence from './evidence';
import EvidenceDetail from './evidence-detail';
import EvidenceUpdate from './evidence-update';
import EvidenceDeleteDialog from './evidence-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={EvidenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={EvidenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={EvidenceDetail} />
      <ErrorBoundaryRoute path={match.url} component={Evidence} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={EvidenceDeleteDialog} />
  </>
);

export default Routes;
