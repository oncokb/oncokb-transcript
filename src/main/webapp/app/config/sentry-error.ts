import * as Sentry from '@sentry/react';

export function notifySentryException(errorMessage, data: Record<string, unknown>) {
  return Sentry.captureException(errorMessage, scope => {
    scope.setExtra('functionArgs', JSON.stringify(data));
    return scope;
  });
}
export class SentryError extends Error {
  public sentryId: string;
  constructor(errMessage: string, data: any) {
    super(errMessage);

    this.name = 'SentryError';

    this.sentryId = notifySentryException(errMessage, data);
  }
}
