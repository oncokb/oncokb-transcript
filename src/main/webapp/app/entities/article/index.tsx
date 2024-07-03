import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Article from './article';
import ArticleDetail from './article-detail';
import ArticleUpdate from './article-update';
import ArticleDeleteDialog from './article-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ArticleUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ArticleUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ArticleDetail} />
      <ErrorBoundaryRoute path={match.url} component={Article} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ArticleDeleteDialog} />
  </>
);

export default Routes;
