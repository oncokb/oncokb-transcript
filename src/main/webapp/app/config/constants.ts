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
  OAUTH = '/oauth2/authorization/oidc',
  ADMIN_USER_MANAGEMENT = '/admin/user-management',
  SEARCH = '/search',
  /* Below are the entity paths */
  ARTICLE = '/article',
  GENE = '/gene',
  ALTERATION = '/alteration',
  DRUG = '/drug',
  FDA_SUBMISSION = '/fda-submission',
  FDA_SUBMISSION_TYPE = '/fda-submission-type',
  CDX = '/companion-diagnostic-device',
  SPECIMEN_TYPE = '/specimen-type',
}

export const ENTITY_ROUTE_TO_TITLE_MAPPING: { [key in PAGE_ROUTE]?: string } = {
  [PAGE_ROUTE.FDA_SUBMISSION]: 'FDA Submissions',
  [PAGE_ROUTE.FDA_SUBMISSION_TYPE]: 'FDA Submission Type',
  [PAGE_ROUTE.CDX]: 'Companion Diagnostic Devices',
  [PAGE_ROUTE.ARTICLE]: 'Articles',
  [PAGE_ROUTE.DRUG]: 'Drugs',
  [PAGE_ROUTE.GENE]: 'Genes',
  [PAGE_ROUTE.ALTERATION]: 'Alterations',
};

export enum ENTITY_ACTION {
  CREATE = 'Create',
  VIEW = 'View',
  EDIT = 'Edit',
  CURATE = 'Curate',
  DELETE = 'Delete',
}

export const ENTITY_ACTION_PATH: { [key in ENTITY_ACTION]: string } = {
  [ENTITY_ACTION.CREATE]: '/new',
  [ENTITY_ACTION.VIEW]: '',
  [ENTITY_ACTION.EDIT]: '/edit',
  [ENTITY_ACTION.CURATE]: '/curate',
  [ENTITY_ACTION.DELETE]: '/delete',
};

export enum ENTITY_TYPE {
  COMPANION_DIAGNOSTIC_DEVICE,
  FDA_SUBMISSION,
  GENE,
  ALTERATION,
  DRUG,
  ARTICLE,
  USER,
}

export const ENTITY_BASE_PATHS: { [key in ENTITY_TYPE]: PAGE_ROUTE } = {
  [ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE]: PAGE_ROUTE.CDX,
  [ENTITY_TYPE.FDA_SUBMISSION]: PAGE_ROUTE.FDA_SUBMISSION,
  [ENTITY_TYPE.GENE]: PAGE_ROUTE.GENE,
  [ENTITY_TYPE.ALTERATION]: PAGE_ROUTE.ALTERATION,
  [ENTITY_TYPE.DRUG]: PAGE_ROUTE.DRUG,
  [ENTITY_TYPE.ARTICLE]: PAGE_ROUTE.ARTICLE,
  [ENTITY_TYPE.USER]: PAGE_ROUTE.ADMIN_USER_MANAGEMENT,
};

export enum SearchOptionType {
  FDA_SUBMISSION = 'FDA Submissions',
  CDX = 'Companion Diagnostic Devices',
  ARTICLE = 'Articles',
  DRUG = 'Drugs',
  GENE = 'Genes',
  ALTERATION = 'Alterations',
  CANCER_TYPE = 'Cancer Types',
}

export enum USER_AUTHORITY {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
}

export const DEFAULT_SORT_PARAMETER = 'id,ASC';

export const DEFAULT_SORT_DIRECTION = 'ASC';

export const DEFAULT_ENTITY_SORT_FIELD: { [key in ENTITY_TYPE]?: string } = {
  [ENTITY_TYPE.GENE]: 'hugoSymbol',
  [ENTITY_TYPE.ALTERATION]: 'name',
  [ENTITY_TYPE.DRUG]: 'name',
  [ENTITY_TYPE.FDA_SUBMISSION]: 'deviceName',
};

export const FDA_SUBMISSION_REGEX = new RegExp('^([A-Z]+[0-9]+)(\\/((S[0-9]+)(-(S[0-9]+))?))?');
