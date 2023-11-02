import { PAGE_ROUTE, REDIRECT_TIMEOUT_MILLISECONDS } from 'app/config/constants';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Alert } from 'reactstrap';

const PageNotFound: React.FunctionComponent = () => {
  const [shouldBeRedirected, setShouldBeRedirected] = useState(false);

  useEffect(() => {
    setTimeout(() => setShouldBeRedirected(true), REDIRECT_TIMEOUT_MILLISECONDS);
  }, []);

  return (
    <div>
      {shouldBeRedirected ? (
        <Redirect to={PAGE_ROUTE.HOME} />
      ) : (
        <Alert color="danger">The page does not exist. You will be redirected to home page.</Alert>
      )}
    </div>
  );
};

export default PageNotFound;
