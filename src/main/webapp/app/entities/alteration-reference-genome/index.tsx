import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import AlterationReferenceGenome from './alteration-reference-genome';
import AlterationReferenceGenomeDetail from './alteration-reference-genome-detail';
import AlterationReferenceGenomeUpdate from './alteration-reference-genome-update';
import AlterationReferenceGenomeDeleteDialog from './alteration-reference-genome-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={AlterationReferenceGenomeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={AlterationReferenceGenomeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={AlterationReferenceGenomeDetail} />
      <ErrorBoundaryRoute path={match.url} component={AlterationReferenceGenome} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={AlterationReferenceGenomeDeleteDialog} />
  </>
);

export default Routes;
