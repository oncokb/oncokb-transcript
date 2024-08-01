import { ToastOptions, toast } from 'react-toastify';
import _ from 'lodash';
import { DEFAULT_TOAST_ERROR_OPTIONS } from 'app/config/constants/constants';

const getFormattedMessage = (message: string) => {
  return _.upperFirst(message);
};

const getErrorMessage = (error: unknown, additionalInfo?: string) => {
  const content: string[] = [];
  if (_.isObject(error)) {
    if (
      'response' in error &&
      _.isObject(error.response) &&
      'data' in error.response &&
      'data' in error.response &&
      _.isObject(error.response.data)
    ) {
      if ('title' in error.response.data && _.isString(error.response.data.title)) {
        content.push(error.response.data.title);
      }
      if ('message' in error.response.data && _.isString(error.response.data.message)) {
        content.push(error.response.data.message);
      }
    } else if ('message' in error && _.isString(error.message)) {
      content.push(error.message);
    } else {
      content.push('unknown error');
    }
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

export const notifyWarning = (error: unknown, additionalInfo?: string, options?: ToastOptions) => {
  return toast.warn(getErrorMessage(error, additionalInfo), options);
};

export const notifyError = (error: unknown, additionalInfo?: string, options?: ToastOptions) => {
  if (_.isObject(error)) {
    if ('sentryId' in error) {
      additionalInfo = `\n Please reach out to dev team with error code: ${error.sentryId}`;
    }
    return toast.error(getErrorMessage(error, additionalInfo), options || DEFAULT_TOAST_ERROR_OPTIONS);
  } else if (typeof error === 'string') {
    return toast.error(error, options || DEFAULT_TOAST_ERROR_OPTIONS);
  } else {
    return toast.error(getFormattedMessage('something went wrong'));
  }
};
