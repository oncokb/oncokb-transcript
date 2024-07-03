import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import EnsemblGene from './ensembl-gene';
import EnsemblGeneDetail from './ensembl-gene-detail';
import EnsemblGeneUpdate from './ensembl-gene-update';
import EnsemblGeneDeleteDialog from './ensembl-gene-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={EnsemblGeneUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={EnsemblGeneUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={EnsemblGeneDetail} />
      <ErrorBoundaryRoute path={match.url} component={EnsemblGene} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={EnsemblGeneDeleteDialog} />
  </>
);

export default Routes;
