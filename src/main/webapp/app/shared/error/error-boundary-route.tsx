import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import ErrorBoundary from 'app/shared/error/error-boundary';

// TYPE-ISSUE: wasn't sure how to make the types happy
// since this component probably isn't going to be refactor often I just used any :'(
export const ErrorBoundaryRoute = ({ component, ...rest }: RouteProps) => {
  const Component = component as any;
  const encloseInErrorBoundary = props => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  if (!Component) throw new Error(`A component needs to be specified for path ${(rest as any).path}`);

  return <Route {...rest} render={encloseInErrorBoundary} />;
};

export default ErrorBoundaryRoute;
