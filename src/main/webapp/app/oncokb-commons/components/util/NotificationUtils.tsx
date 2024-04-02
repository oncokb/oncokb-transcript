import { ToastOptions, toast } from 'react-toastify';
import _ from 'lodash';
import { OncoKBError } from '../alert/ErrorAlertUtils';

const getFormattedMessage = (message: string) => {
  return _.upperFirst(message);
};
const getErrorMessage = (error: OncoKBError, additionalInfo?: string) => {
  const content: string[] = [];
  if (additionalInfo) {
    content.push(additionalInfo);
  }
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
export const notifyError = (error: Error | OncoKBError, additionalInfo?: string, options?: ToastOptions) => {
  return toast.error(getErrorMessage(error, additionalInfo), options);
};
