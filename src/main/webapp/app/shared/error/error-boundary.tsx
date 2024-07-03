import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import * as Sentry from '@sentry/react';

interface IErrorBoundaryProps {
  readonly children: JSX.Element | JSX.Element[];
}

interface IErrorBoundaryState {
  readonly error: any;
  readonly errorInfo: any;
}

class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  private defaultState = { error: undefined, errorInfo: undefined };
  readonly state: IErrorBoundaryState = this.defaultState;

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { error, errorInfo } = this.state;
    if (errorInfo) {
      const errorDetails = DEVELOPMENT ? (
        <details className="preserve-space">
          {error && error.toString()}
          <br />
          {errorInfo.componentStack}
        </details>
      ) : undefined;

      // Always send crash error to sentry
      Sentry.captureException(error ? error : errorInfo);

      return (
        <div>
          <Button tag={Link} className={'mb-2'} to="/" replace color="primary" onClick={() => this.setState(this.defaultState)}>
            <span className="d-none d-md-inline">Back to Home Page</span>
          </Button>
          <h2 className="error">An unexpected error has occurred.</h2>
          {errorDetails}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
