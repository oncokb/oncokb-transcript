import * as Sentry from '@sentry/react';

export class SentryError extends Error {
  public sentryId: string;
  constructor(errMessage: string, data: any) {
    super(errMessage);

    this.name = 'SentryError';

    this.sentryId = Sentry.captureException(errMessage, scope => {
      scope.setExtra('functionArgs', JSON.stringify(data));
      return scope;
    });
  }
}
