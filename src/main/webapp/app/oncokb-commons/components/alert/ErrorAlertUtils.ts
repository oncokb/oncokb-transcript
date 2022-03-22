type OncoKBErrorResponseBody = {
  type: string;
  title: string;
  status: number;
  detail: string;
  path: string;
  message: string;
  trialActivationKey?: string;
};
type OncoKBResponse = Response & {
  data?: OncoKBErrorResponseBody;
};

export type OncoKBError = Error & {
  response?: OncoKBResponse;
};

export const getErrorMessage = (error: OncoKBError) => {
  let errorMessage = error.message;
  if (error.response && error.response.data) {
    if (error.response.data.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response.data.title) {
      errorMessage = error.response.data.title;
    }
  }
  return errorMessage;
};
