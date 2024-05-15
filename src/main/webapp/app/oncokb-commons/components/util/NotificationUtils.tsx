import { ToastOptions, toast } from 'react-toastify';
import _ from 'lodash';
import { OncoKBError } from '../alert/ErrorAlertUtils';
import { DEFAULT_TOAST_ERROR_OPTIONS, LONG_TOAST_CLOSE_MILLISECONDS } from 'app/config/constants/constants';
import { SentryError } from 'app/config/sentry-error';

const getFormattedMessage = (message: string) => {
  return _.upperFirst(message);
};
const getErrorMessage = (error: OncoKBError, additionalInfo?: string) => {
  const content: string[] = [];
  if (error.response?.data) {
    if (error.response.data.title) {
      content.push(error.response.data.title);
    }
    if (error.response.data.message) {
      content.push(error.response.data.message);
    }
  } else {
    content.push(error.message);
  }
  if (additionalInfo) {
    content.push(additionalInfo);
  }
  return content.map(item => getFormattedMessage(item)).join('\n');
};

export const notifyInfo = (message: string, options?: ToastOptions) => {
  return toast.info(getFormattedMessage(message), options);
};

export const notifySuccess = (message: string, options?: ToastOptions) => {
  return toast.success(getFormattedMessage(message), options);
};
export const notifyWarning = (error: OncoKBError, additionalInfo?: string, options?: ToastOptions) => {
  return toast.warn(getErrorMessage(error, additionalInfo), options);
};
export const notifyError = (error: Error | OncoKBError | SentryError, additionalInfo?: string, options?: ToastOptions) => {
  if ('sentryId' in error) {
    additionalInfo = `\n Please reach out to dev team with error code: ${error.sentryId}`;
  }
  return toast.error(getErrorMessage(error, additionalInfo), options || DEFAULT_TOAST_ERROR_OPTIONS);
};
