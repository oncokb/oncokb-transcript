import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import BiomarkerAssociation from './biomarker-association';
import BiomarkerAssociationDetail from './biomarker-association-detail';
import BiomarkerAssociationUpdate from './biomarker-association-update';
import BiomarkerAssociationDeleteDialog from './biomarker-association-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={BiomarkerAssociationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={BiomarkerAssociationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={BiomarkerAssociationDetail} />
      <ErrorBoundaryRoute path={match.url} component={BiomarkerAssociation} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={BiomarkerAssociationDeleteDialog} />
  </>
);

export default Routes;
