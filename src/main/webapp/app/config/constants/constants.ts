export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  CURATOR: 'ROLE_CURATOR',
};

export const messages = {
  DATA_ERROR_ALERT: 'Internal Error',
};

export const APP_DATE_FORMAT = 'MM/DD/YY HH:mm';
export const APP_TIMESTAMP_FORMAT = 'MM/DD/YY HH:mm:ss';
export const APP_LOCAL_DATE_FORMAT = 'MM/DD/YYYY';
export const APP_DATETIME_FORMAT = 'MM/DD/YYYY h:mm A';
export const APP_LOCAL_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';
export const APP_WHOLE_NUMBER_FORMAT = '0,0';
export const APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT = '0,0.[00]';
export const APP_EXPANDED_DATETIME_FORMAT = 'MMM D, YYYY h:mm A';
export const APP_HISTORY_FORMAT = 'MMM D, YYYY';
export const APP_TIME_FORMAT = 'h:mm A';

export const REDIRECT_TIMEOUT_MILLISECONDS = 10000;
export const SHORT_REDIRECT = 2000;
export const CLOSE_TOOLTIP_DURATION_MILLISECONDS = 300;
export const MAX_COMMENT_LENGTH = 100;

export const GET_ALL_DRUGS_PAGE_SIZE = 100000;

export enum REFERENCE_GENOME {
  GRCH37 = 'GRCh37',
  GRCH38 = 'GRCh38',
}

export enum ENTITY_TYPE {
  ALTERATION = 'alteration',
  ARTICLE = 'article',
  ASSOCIATION = 'association',
  ASSOCIATION_CANCER_TYPE = 'association-cancer-type',
  CANCER_TYPE = 'cancer-type',
  CATEGORICAL_ALTERATION = 'categorical-alteration',
  CLINICAL_TRIAL = 'clinical-trial',
  CLINICAL_TRIAL_ARM = 'clinical-trial-arm',
  COMPANION_DIAGNOSTIC_DEVICE = 'companion-diagnostic-device',
  CONSEQUENCE = 'consequence',
  DRUG = 'drug',
  DRUG_BRAND = 'drug-brand',
  DRUG_PRIORITY = 'drug-priority',
  ELIGIBILITY_CRITERIA = 'eligibility-criteria',
  ENSEMBL_GENE = 'ensembl-gene',
  EVIDENCE = 'evidence',
  FDA_DRUG = 'fda-drug',
  FDA_SUBMISSION = 'fda-submission',
  FDA_SUBMISSION_TYPE = 'fda-submission-type',
  FLAG = 'flag',
  GENE = 'gene',
  GENOME_FRAGMENT = 'genome-fragment',
  GENOMIC_INDICATOR = 'genomic-indicator',
  INFO = 'info',
  LEVEL_OF_EVIDENCE = 'level-of-evidence',
  NCI_THESAURUS = 'nci-thesaurus',
  SEQ_REGION = 'seq-region',
  SEQUENCE = 'sequence',
  SPECIMEN_TYPE = 'specimen-type',
  SYNONYM = 'synonym',
  TRANSCRIPT = 'transcript',
  TREATMENT = 'treatment',
  TREATMENT_PRIORITY = 'treatment-priority',
  USER = 'user',
}

export enum ENTITY_PAGE_ROUTE {
  ALTERATION = '/alteration',
  ARTICLE = '/article',
  CANCER_TYPE = '/cancer-type',
  CATEGORICAL_ALTERATION = '/categorical-alteration',
  CLINICAL_TRIAL = '/clinical-trial',
  CLINICAL_TRIAL_ARM = '/clinical-trial-arm',
  COMPANION_DIAGNOSTIC_DEVICE = '/companion-diagnostic-device',
  CONSEQUENCE = '/consequence',
  DRUG = '/drug',
  DRUG_BRAND = '/drug-brand',
  DRUG_PRIORITY = '/drug-priority',
  ELIGIBILITY_CRITERIA = '/eligibility-criteria',
  ENSEMBL_GENE = '/ensembl-gene',
  EVIDENCE = '/evidence',
  FDA_DRUG = '/fda-drug',
  FDA_SUBMISSION = '/fda-submission',
  FDA_SUBMISSION_TYPE = '/fda-submission-type',
  FLAG = '/flag',
  GENE = '/gene',
  GENOME_FRAGMENT = '/genome-fragment',
  GENOMIC_INDICATOR = '/genomic-indicator',
  INFO = '/info',
  LEVEL_OF_EVIDENCE = '/level-of-evidence',
  NCI_THESAURUS = '/nci-thesaurus',
  SEQ_REGION = '/seq-region',
  SEQUENCE = '/sequence',
  SPECIMEN_TYPE = '/specimen-type',
  SYNONYM = '/synonym',
  TRANSCRIPT = '/transcript',
  TREATMENT = '/treatment',
  TREATMENT_PRIORITY = '/treatment-priority',
  USER = '/admin/user-management',
}

export enum FEATURE_PAGE_ROUTE {
  HOME = '/',
  LOGIN = '/login',
  LOGOUT = '/logout',
  ACCOUNT = '/account',
  OAUTH = '/oauth2/authorization/oidc',
  SEARCH = '/search',
  /* Below are curation related paths */
  CURATION = '/curation',
  CURATION_GENE = '/curation/:hugoSymbol',
}

export const PAGE_ROUTE = {
  ...FEATURE_PAGE_ROUTE,
  ...ENTITY_PAGE_ROUTE,
};
export type PAGE_ROUTE = ENTITY_PAGE_ROUTE | FEATURE_PAGE_ROUTE;

export enum ENTITY_RESOURCE_PATH {
  ALTERATION = '/alterations',
  ARTICLE = '/articles',
  ASSOCIATION = '/associations',
  ASSOCIATION_CANCER_TYPE = '/association-cancer-types',
  CANCER_TYPE = '/cancer-types',
  CATEGORICAL_ALTERATION = '/categorical-alterations',
  CLINICAL_TRIAL = '/clinical-trials',
  CLINICAL_TRIAL_ARM = '/clinical-trial-arms',
  COMPANION_DIAGNOSTIC_DEVICE = '/companion-diagnostic-devices',
  CONSEQUENCE = '/consequences',
  DRUG = '/drugs',
  DRUG_BRAND = '/drug-brands',
  DRUG_PRIORITY = '/drug-priorities',
  ELIGIBILITY_CRITERIA = '/eligibility-criteria',
  ENSEMBL_GENE = '/ensembl-genes',
  EVIDENCE = '/evidences',
  FDA_DRUG = '/fda-drugs',
  FDA_SUBMISSION = '/fda-submissions',
  FDA_SUBMISSION_TYPE = '/fda-submission-types',
  FLAG = '/flags',
  GENE = '/genes',
  GENOME_FRAGMENT = '/genome-fragments',
  GENOMIC_INDICATOR = '/genomic-indicators',
  INFO = '/infos',
  LEVEL_OF_EVIDENCE = '/level-of-evidences',
  NCI_THESAURUS = '/nci-thesauruses',
  SEQ_REGION = '/seq-regions',
  SEQUENCE = '/sequences',
  SPECIMEN_TYPE = '/specimen-types',
  SYNONYM = '/synonyms',
  TRANSCRIPT = '/transcripts',
  TREATMENT = '/treatments',
  TREATMENT_PRIORITY = '/treatment-priorities',
  USER = '/users',
}

export const ENTITY_INFO: { [key in ENTITY_TYPE]: { pageRoute?: ENTITY_PAGE_ROUTE; resourcePath: ENTITY_RESOURCE_PATH } } = {
  [ENTITY_TYPE.ALTERATION]: {
    pageRoute: ENTITY_PAGE_ROUTE.ALTERATION,
    resourcePath: ENTITY_RESOURCE_PATH.ALTERATION,
  },
  [ENTITY_TYPE.ARTICLE]: {
    pageRoute: ENTITY_PAGE_ROUTE.ARTICLE,
    resourcePath: ENTITY_RESOURCE_PATH.ARTICLE,
  },
  [ENTITY_TYPE.ASSOCIATION]: {
    resourcePath: ENTITY_RESOURCE_PATH.ASSOCIATION,
  },
  [ENTITY_TYPE.ASSOCIATION_CANCER_TYPE]: {
    resourcePath: ENTITY_RESOURCE_PATH.ASSOCIATION_CANCER_TYPE,
  },
  [ENTITY_TYPE.CANCER_TYPE]: {
    pageRoute: ENTITY_PAGE_ROUTE.CANCER_TYPE,
    resourcePath: ENTITY_RESOURCE_PATH.CANCER_TYPE,
  },
  [ENTITY_TYPE.CATEGORICAL_ALTERATION]: {
    pageRoute: ENTITY_PAGE_ROUTE.CATEGORICAL_ALTERATION,
    resourcePath: ENTITY_RESOURCE_PATH.CATEGORICAL_ALTERATION,
  },
  [ENTITY_TYPE.CLINICAL_TRIAL]: {
    pageRoute: ENTITY_PAGE_ROUTE.CLINICAL_TRIAL,
    resourcePath: ENTITY_RESOURCE_PATH.CLINICAL_TRIAL,
  },
  [ENTITY_TYPE.CLINICAL_TRIAL_ARM]: {
    pageRoute: ENTITY_PAGE_ROUTE.CLINICAL_TRIAL_ARM,
    resourcePath: ENTITY_RESOURCE_PATH.CLINICAL_TRIAL_ARM,
  },
  [ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE]: {
    pageRoute: ENTITY_PAGE_ROUTE.COMPANION_DIAGNOSTIC_DEVICE,
    resourcePath: ENTITY_RESOURCE_PATH.COMPANION_DIAGNOSTIC_DEVICE,
  },
  [ENTITY_TYPE.CONSEQUENCE]: {
    pageRoute: ENTITY_PAGE_ROUTE.CONSEQUENCE,
    resourcePath: ENTITY_RESOURCE_PATH.CONSEQUENCE,
  },
  [ENTITY_TYPE.DRUG]: {
    pageRoute: ENTITY_PAGE_ROUTE.DRUG,
    resourcePath: ENTITY_RESOURCE_PATH.DRUG,
  },
  [ENTITY_TYPE.DRUG_BRAND]: {
    pageRoute: ENTITY_PAGE_ROUTE.DRUG_BRAND,
    resourcePath: ENTITY_RESOURCE_PATH.DRUG_BRAND,
  },
  [ENTITY_TYPE.DRUG_PRIORITY]: {
    pageRoute: ENTITY_PAGE_ROUTE.DRUG_PRIORITY,
    resourcePath: ENTITY_RESOURCE_PATH.DRUG_PRIORITY,
  },
  [ENTITY_TYPE.ELIGIBILITY_CRITERIA]: {
    pageRoute: ENTITY_PAGE_ROUTE.ELIGIBILITY_CRITERIA,
    resourcePath: ENTITY_RESOURCE_PATH.ELIGIBILITY_CRITERIA,
  },
  [ENTITY_TYPE.ENSEMBL_GENE]: {
    pageRoute: ENTITY_PAGE_ROUTE.ENSEMBL_GENE,
    resourcePath: ENTITY_RESOURCE_PATH.ENSEMBL_GENE,
  },
  [ENTITY_TYPE.EVIDENCE]: {
    pageRoute: ENTITY_PAGE_ROUTE.EVIDENCE,
    resourcePath: ENTITY_RESOURCE_PATH.EVIDENCE,
  },
  [ENTITY_TYPE.FDA_DRUG]: {
    pageRoute: ENTITY_PAGE_ROUTE.FDA_DRUG,
    resourcePath: ENTITY_RESOURCE_PATH.FDA_DRUG,
  },
  [ENTITY_TYPE.FDA_SUBMISSION]: {
    pageRoute: ENTITY_PAGE_ROUTE.FDA_SUBMISSION,
    resourcePath: ENTITY_RESOURCE_PATH.FDA_SUBMISSION,
  },
  [ENTITY_TYPE.FDA_SUBMISSION_TYPE]: {
    pageRoute: ENTITY_PAGE_ROUTE.FDA_SUBMISSION_TYPE,
    resourcePath: ENTITY_RESOURCE_PATH.FDA_SUBMISSION_TYPE,
  },
  [ENTITY_TYPE.FLAG]: {
    pageRoute: ENTITY_PAGE_ROUTE.FLAG,
    resourcePath: ENTITY_RESOURCE_PATH.FLAG,
  },
  [ENTITY_TYPE.GENE]: {
    pageRoute: ENTITY_PAGE_ROUTE.GENE,
    resourcePath: ENTITY_RESOURCE_PATH.GENE,
  },
  [ENTITY_TYPE.GENOME_FRAGMENT]: {
    pageRoute: ENTITY_PAGE_ROUTE.GENOME_FRAGMENT,
    resourcePath: ENTITY_RESOURCE_PATH.GENOME_FRAGMENT,
  },
  [ENTITY_TYPE.GENOMIC_INDICATOR]: {
    pageRoute: ENTITY_PAGE_ROUTE.GENOMIC_INDICATOR,
    resourcePath: ENTITY_RESOURCE_PATH.GENOMIC_INDICATOR,
  },
  [ENTITY_TYPE.INFO]: {
    pageRoute: ENTITY_PAGE_ROUTE.INFO,
    resourcePath: ENTITY_RESOURCE_PATH.INFO,
  },
  [ENTITY_TYPE.LEVEL_OF_EVIDENCE]: {
    pageRoute: ENTITY_PAGE_ROUTE.LEVEL_OF_EVIDENCE,
    resourcePath: ENTITY_RESOURCE_PATH.LEVEL_OF_EVIDENCE,
  },
  [ENTITY_TYPE.NCI_THESAURUS]: {
    pageRoute: ENTITY_PAGE_ROUTE.NCI_THESAURUS,
    resourcePath: ENTITY_RESOURCE_PATH.NCI_THESAURUS,
  },
  [ENTITY_TYPE.SEQ_REGION]: {
    pageRoute: ENTITY_PAGE_ROUTE.SEQ_REGION,
    resourcePath: ENTITY_RESOURCE_PATH.SEQ_REGION,
  },
  [ENTITY_TYPE.SEQUENCE]: {
    pageRoute: ENTITY_PAGE_ROUTE.SEQUENCE,
    resourcePath: ENTITY_RESOURCE_PATH.SEQUENCE,
  },
  [ENTITY_TYPE.SPECIMEN_TYPE]: {
    pageRoute: ENTITY_PAGE_ROUTE.SPECIMEN_TYPE,
    resourcePath: ENTITY_RESOURCE_PATH.SPECIMEN_TYPE,
  },
  [ENTITY_TYPE.SYNONYM]: {
    pageRoute: ENTITY_PAGE_ROUTE.SYNONYM,
    resourcePath: ENTITY_RESOURCE_PATH.SYNONYM,
  },
  [ENTITY_TYPE.TRANSCRIPT]: {
    pageRoute: ENTITY_PAGE_ROUTE.TRANSCRIPT,
    resourcePath: ENTITY_RESOURCE_PATH.TRANSCRIPT,
  },
  [ENTITY_TYPE.TREATMENT]: {
    pageRoute: ENTITY_PAGE_ROUTE.TREATMENT,
    resourcePath: ENTITY_RESOURCE_PATH.TREATMENT,
  },
  [ENTITY_TYPE.TREATMENT_PRIORITY]: {
    pageRoute: ENTITY_PAGE_ROUTE.TREATMENT_PRIORITY,
    resourcePath: ENTITY_RESOURCE_PATH.TREATMENT_PRIORITY,
  },
  [ENTITY_TYPE.USER]: {
    pageRoute: ENTITY_PAGE_ROUTE.USER,
    resourcePath: ENTITY_RESOURCE_PATH.USER,
  },
};

export const ENTITY_TO_TITLE_MAPPING: { [key in ENTITY_TYPE]?: string } = {
  [ENTITY_TYPE.FDA_SUBMISSION]: 'FDA Submissions',
  [ENTITY_TYPE.FDA_SUBMISSION_TYPE]: 'FDA Submission Types',
  [ENTITY_TYPE.NCI_THESAURUS]: 'NCI Thesaurus Terms',
};

export enum ENTITY_ACTION {
  ADD = 'Add',
  VIEW = 'View',
  EDIT = 'Edit',
  CURATE = 'Curate',
  DELETE = 'Delete',
}

export const ENTITY_ACTION_PATH: { [key in ENTITY_ACTION]: string } = {
  [ENTITY_ACTION.ADD]: '/new',
  [ENTITY_ACTION.VIEW]: '',
  [ENTITY_ACTION.EDIT]: '/edit',
  [ENTITY_ACTION.CURATE]: '/curate',
  [ENTITY_ACTION.DELETE]: '/delete',
};

export enum SearchOptionType {
  FDA_SUBMISSION = 'FDA Submissions',
  CDX = 'Companion Diagnostic Devices',
  ARTICLE = 'Articles',
  DRUG = 'Drugs',
  GENE = 'Genes',
  ALTERATION = 'Alterations',
  CANCER_TYPE = 'Cancer Types',
  NCIT = 'NCI Thesaurus Codes',
}

export enum USER_AUTHORITY {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_CURATOR = 'ROLE_CURATOR',
}

export const DEFAULT_SORT_PARAMETER = 'id,ASC';

export const DEFAULT_SORT_DIRECTION = 'ASC';

export const DEFAULT_ENTITY_SORT_FIELD: { [key in ENTITY_TYPE]?: string } = {
  [ENTITY_TYPE.GENE]: 'hugoSymbol',
  [ENTITY_TYPE.ALTERATION]: 'name',
  [ENTITY_TYPE.DRUG]: 'name',
  [ENTITY_TYPE.FDA_SUBMISSION]: 'deviceName',
  [ENTITY_TYPE.CLINICAL_TRIAL]: 'title',
  [ENTITY_TYPE.GENOMIC_INDICATOR]: 'name',
  [ENTITY_TYPE.NCI_THESAURUS]: 'code',
  [ENTITY_TYPE.SYNONYM]: 'name',
  [ENTITY_TYPE.TREATMENT]: 'drugs',
  [ENTITY_TYPE.ARTICLE]: 'title',
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

export const DEFAULT_NAV_ICON_SIZE = 25;

export const CANCER_TYPE_THERAPY_INDENTIFIER = '&';

export const CURRENT_REVIEWER = 'currentReviewer';

export const RADIO_OPTION_NONE = 'None';

/* Checkbox has margin of -18.75px, so can set to 0px and add margin to label can use this to adjust */
export const CHECKBOX_LABEL_LEFT_MARGIN = 18.75;

/* Regex constants */
export const FDA_SUBMISSION_REGEX = new RegExp('^([A-Z]+[0-9]+)(\\/((S[0-9]+)(-(S[0-9]+))?))?');
export const UUID_REGEX = new RegExp('\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}');
export const INTEGER_REGEX = new RegExp('^\\d+$');

export const CURATE_NEW_GENE_TEXT = 'Curate New Gene';
