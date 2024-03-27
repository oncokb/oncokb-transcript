import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import LevelOfEvidence from './level-of-evidence';
import LevelOfEvidenceDetail from './level-of-evidence-detail';
import LevelOfEvidenceUpdate from './level-of-evidence-update';
import LevelOfEvidenceDeleteDialog from './level-of-evidence-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={LevelOfEvidenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={LevelOfEvidenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={LevelOfEvidenceDetail} />
      <ErrorBoundaryRoute path={match.url} component={LevelOfEvidence} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={LevelOfEvidenceDeleteDialog} />
  </>
);

export default Routes;
