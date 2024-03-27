import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import NciThesaurus from './nci-thesaurus';
import NciThesaurusDetail from './nci-thesaurus-detail';
import NciThesaurusUpdate from './nci-thesaurus-update';
import NciThesaurusDeleteDialog from './nci-thesaurus-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={NciThesaurusUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={NciThesaurusUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={NciThesaurusDetail} />
      <ErrorBoundaryRoute path={match.url} component={NciThesaurus} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={NciThesaurusDeleteDialog} />
  </>
);

export default Routes;
