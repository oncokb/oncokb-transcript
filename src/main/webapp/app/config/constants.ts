export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  FIREBASE: 'ROLE_FIREBASE',
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

export enum REFERENCE_GENOME {
  GRCH37 = 'GRCh37',
  GRCH38 = 'GRCh38',
}

export enum PAGE_ROUTE {
  HOME = '/',
  LOGIN = '/login',
  LOGOUT = '/logout',
  ACCOUNT = '/account',
  OAUTH = '/oauth2/authorization/oidc',
  ADMIN_USER_MANAGEMENT = '/admin/user-management',
  SEARCH = '/search',
  /* Below are curation related paths */
  CURATION = '/curation',
  CURATION_GENE = '/curation/:hugoSymbol',
  /* Below are the entity paths */
  ARTICLE = '/article',
  GENE = '/gene',
  ALTERATION = '/alteration',
  DRUG = '/drug',
  FDA_SUBMISSION = '/fda-submission',
  FDA_SUBMISSION_TYPE = '/fda-submission-type',
  CDX = '/companion-diagnostic-device',
  SPECIMEN_TYPE = '/specimen-type',
  CT_GOV_CONDITION = '/clinical-trials-gov-condition',
  ENSEMBL_GENE = '/ensembl-gene',
  TRANSCRIPT = '/transcript',
  TRANSCRIPT_FLAG = '/transcript-flag',
  GENE_FLAG = '/gene-flag',
}

export const ENTITY_ROUTE_TO_TITLE_MAPPING: { [key in PAGE_ROUTE]?: string } = {
  [PAGE_ROUTE.FDA_SUBMISSION]: 'FDA Submissions',
  [PAGE_ROUTE.FDA_SUBMISSION_TYPE]: 'FDA Submission Type',
  [PAGE_ROUTE.CDX]: 'Companion Diagnostic Devices',
  [PAGE_ROUTE.ARTICLE]: 'Articles',
  [PAGE_ROUTE.DRUG]: 'Drugs',
  [PAGE_ROUTE.GENE]: 'Genes',
  [PAGE_ROUTE.ALTERATION]: 'Alterations',
  [PAGE_ROUTE.CT_GOV_CONDITION]: 'CT.gov Conditions',
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
  COMPANION_DIAGNOSTIC_DEVICE = 'companion-diagnostic-device',
  FDA_SUBMISSION = 'fda-submission',
  SPECIMEN_TYPE = 'specimen-type',
  GENE = 'gene',
  ALTERATION = 'alteration',
  DRUG = 'drug',
  ARTICLE = 'article',
  USER = 'user',
  CT_GOV_CONDITION = 'ct-gov-condition',
  ENSEMBL_GENE = 'ensembl-gene',
  TRANSCRIPT = 'transcript',
  TRANSCRIPT_FLAG = 'transcript-flag',
  GENE_FLAG = 'gene-flag',
}

export const ENTITY_BASE_PATHS: { [key in ENTITY_TYPE]: PAGE_ROUTE } = {
  [ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE]: PAGE_ROUTE.CDX,
  [ENTITY_TYPE.FDA_SUBMISSION]: PAGE_ROUTE.FDA_SUBMISSION,
  [ENTITY_TYPE.SPECIMEN_TYPE]: PAGE_ROUTE.SPECIMEN_TYPE,
  [ENTITY_TYPE.GENE]: PAGE_ROUTE.GENE,
  [ENTITY_TYPE.ALTERATION]: PAGE_ROUTE.ALTERATION,
  [ENTITY_TYPE.DRUG]: PAGE_ROUTE.DRUG,
  [ENTITY_TYPE.ARTICLE]: PAGE_ROUTE.ARTICLE,
  [ENTITY_TYPE.USER]: PAGE_ROUTE.ADMIN_USER_MANAGEMENT,
  [ENTITY_TYPE.CT_GOV_CONDITION]: PAGE_ROUTE.CT_GOV_CONDITION,
  [ENTITY_TYPE.ENSEMBL_GENE]: PAGE_ROUTE.ENSEMBL_GENE,
  [ENTITY_TYPE.TRANSCRIPT]: PAGE_ROUTE.TRANSCRIPT,
  [ENTITY_TYPE.TRANSCRIPT_FLAG]: PAGE_ROUTE.TRANSCRIPT_FLAG,
  [ENTITY_TYPE.GENE_FLAG]: PAGE_ROUTE.GENE_FLAG,
};

export enum SearchOptionType {
  FDA_SUBMISSION = 'FDA Submissions',
  CDX = 'Companion Diagnostic Devices',
  ARTICLE = 'Articles',
  DRUG = 'Drugs',
  GENE = 'Genes',
  ALTERATION = 'Alterations',
  CANCER_TYPE = 'Cancer Types',
  CT_GOV_CONDITION = 'CT.gov Conditions',
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
  [ENTITY_TYPE.CT_GOV_CONDITION]: 'name',
};

export enum ONCOGENICITY {
  ONCOGENIC = 'Oncogenic',
  LIKELY_ONCOGENIC = 'Likely Oncogenic',
  PREDICTED_ONCOGENIC = 'Predicted Oncogenic',
  RESISTANCE = 'Resistance',
  LIKELY_NEUTRAL = 'Likely Neutral',
  NEUTRAL = 'Neutral',
  INCONCLUSIVE = 'Inconclusive',
  UNKNOWN = 'Unknown',
}

export enum PATHOGENICITY {
  PATHOGENIC = 'Pathogenic',
  LIKELY_PATHOGENIC = 'Likely Pathogenic',
  BENIGN = 'Benign',
  LIKELY_BENIGN = 'Likely Benign',
  UNKNOWN = 'Unknown',
}

export enum MUTATION_EFFECT {
  GAIN_OF_FUNCTION = 'Gain-of-function',
  LIKELY_GAIN_OF_FUNCTION = 'Likely Gain-of-function',
  LOSS_OF_FUNCTION = 'Loss-of-function',
  LIKELY_LOSS_OF_FUNCTION = 'Likely Loss-of-function',
  SWITCH_OF_FUNCTION = 'Switch-of-function',
  LIKELY_SWITCH_OF_FUNCTION = 'Likely Switch-of-function',
  NEUTRAL = 'Neutral',
  LIKELY_NEUTRAL = 'Likely Neutral',
  INCONCLUSIVE = 'Inconclusive',
  UNKNOWN = 'Unknown',
}

export enum PENETRANCE {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
  OTHER = 'Other',
}

export enum GERMLINE_INHERITANCE_MECHANISM {
  RECESSIVE = 'Autosomal Recessive',
  DOMINANT = 'Autosomal Dominant',
}

export const CBIOPORTAL = 'cBioPortal';
export const COSMIC = 'COSMIC';

/* Regex constants */
export const FDA_SUBMISSION_REGEX = new RegExp('^([A-Z]+[0-9]+)(\\/((S[0-9]+)(-(S[0-9]+))?))?');
export const UUID_REGEX = new RegExp('\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}');
export const INTEGER_REGEX = new RegExp('^\\d+$');

/* Firebase constants */
export enum FB_COLLECTION {
  DRUGS = 'Drugs',
  GENES = 'Genes',
  HISTORY = 'History',
  MAP = 'Map',
  META = 'Meta',
  SETTING = 'Setting',
  USERS = 'Users',
  VUS = 'VUS',
}

export const FB_COLLECTION_PATH = {
  GENE: `${FB_COLLECTION.GENES}/:hugoSymbol`,
  MUTATIONS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index`,
  TUMORS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index/tumors/:index`,
  META_GENE: `${FB_COLLECTION.META}/:hugoSymbol`,
  META_GENE_REVIEW: `${FB_COLLECTION.META}/:hugoSymbol/review/:uuid`,
  META_COLLABORATORS: `${FB_COLLECTION.META}/collaborators`,
  META_COLLABORATOR: `${FB_COLLECTION.META}/collaborators/:name`,
  META_COLLABORATOR_GENE: `${FB_COLLECTION.META}/collaborators/:name/:index`,
};
