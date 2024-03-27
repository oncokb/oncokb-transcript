import { toast, ToastContent } from 'react-toastify';

const addErrorAlert = (message, key?, data?) => {
  toast.error(message);
};

export const responseSuccess = (response, message?: ToastContent) => {
  if (message) {
    toast.success(message);
  } else if (response && response.headers) {
    const headers = response.headers;
    let alert: string | null = null;
    headers &&
      Object.entries<string>(headers).forEach(([k, v]) => {
        if (k.toLowerCase().endsWith('app-alert')) {
          alert = v;
        }
      });
    if (alert) {
      toast.success(alert);
    }
  }
};

export const responseFailure = (error, message?: ToastContent) => {
  if (message) {
    toast.error(message);
  } else if (error && error.response) {
    const response = error.response;
    const data = response.data;
    if (
      !(response.status === 401 && (error.message === '' || data.path.includes('/api/account') || data.path.includes('/api/authenticate')))
    ) {
      let i;
      switch (response.status) {
        // connection refused, server not reachable
        case 0:
          addErrorAlert('Server not reachable', 'error.server.not.reachable');
          break;

        case 400: {
          let errorHeader: string | null = null;
          let entityKey: string | null = null;
          response?.headers &&
            Object.entries<string>(response.headers).forEach(([k, v]) => {
              if (k.toLowerCase().endsWith('app-error')) {
                errorHeader = v;
              } else if (k.toLowerCase().endsWith('app-params')) {
                entityKey = v;
              }
            });
          if (errorHeader) {
            const entityName = entityKey;
            addErrorAlert(errorHeader, errorHeader, { entityName });
          } else if (data?.fieldErrors) {
            const fieldErrors = data.fieldErrors;
            for (i = 0; i < fieldErrors.length; i++) {
              const fieldError = fieldErrors[i];
              if (['Min', 'Max', 'DecimalMin', 'DecimalMax'].includes(fieldError.message)) {
                fieldError.message = 'Size';
              }
              // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
              const convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
              const fieldName = convertedField.charAt(0).toUpperCase() + convertedField.slice(1);
              addErrorAlert(`Error on field "${fieldName}"`, `error.${fieldError.message}`, { fieldName });
            }
          } else if (typeof data === 'string' && data !== '') {
            addErrorAlert(data);
          } else if (data && data.message) {
            addErrorAlert(data.message, data.message, data.params);
          } else {
            toast.error(data?.message || data?.error || data?.title || 'Unknown error!');
          }
          break;
        }
        case 404:
          addErrorAlert('Not found', 'error.url.not.found');
          break;

        default:
          if (typeof data === 'string' && data !== '') {
            addErrorAlert(data);
          } else {
            toast.error(data?.message || data?.error || data?.title || 'Unknown error!');
          }
      }
    }
  } else if (error.config && error.config.url === 'api/account' && error.config.method === 'get') {
    /* eslint-disable no-console */
    console.log('Authentication Error: Trying to access url api/account with GET.');
  } else if (error && error.message) {
    toast.error(error.message);
  } else {
    toast.error('Unknown error!');
  }
};
