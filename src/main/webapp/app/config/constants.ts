export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
};

export const messages = {
  DATA_ERROR_ALERT: 'Internal Error',
};

export const APP_DATE_FORMAT = 'DD/MM/YY HH:mm';
export const APP_TIMESTAMP_FORMAT = 'DD/MM/YY HH:mm:ss';
export const APP_LOCAL_DATE_FORMAT = 'DD/MM/YYYY';
export const APP_LOCAL_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';
export const APP_WHOLE_NUMBER_FORMAT = '0,0';
export const APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT = '0,0.[00]';

export const SHORT_REDIRECT = 2000;

export enum PAGE_ROUTE {
  HOME = '/',
  LOGIN = '/login',
  LOGOUT = '/logout',
  ACCOUNT = '/account',
  ARTICLES_SEARCH = '/articles',
  GENE = '/gene',
  ALTERATION = '/alteration',
  DRUG = '/drug',
  FDA_SUBMISSION = '/fda-submission',
  CDD = '/companion-diagnostic-device',
  WORKBENCH = '/workbench',
  OAUTH = '/oauth2/authorization/oidc',
  ADMIN_USER_MANAGEMENT = '/admin/user-management',
}
