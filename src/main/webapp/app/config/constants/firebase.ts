import {
  Gene,
  FIREBASE_ONCOGENICITY,
  TX_LEVELS,
  TI_TYPE,
  HistoryOperationType,
  PX_LEVELS,
  DX_LEVELS,
  FDA_LEVELS,
} from 'app/shared/model/firebase/firebase.model';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { MUTATION_EFFECT, ONCOGENICITY } from './constants';
import { LEVELS } from '../colors';
import { FdaLevelIcon } from 'app/shared/icons/FdaLevelIcon';

/* eslint-disable @typescript-eslint/no-shadow */
export enum GENE_TYPE {
  TUMOR_SUPPRESSOR = 'Tumor Suppressor',
  ONCOGENE = 'Oncogene',
}
export enum ZYGOSITY {
  HETEROZYGOUS = 'Heterozygous',
  HOMOZYGOUS = 'Homozygous',
}
export enum ALLELE_STATE {
  MONOALLELIC = 'Monoallelic',
  BIALLELIC = 'Biallelic',
  MOSAIC = 'Mosaic',
}

export const GENE_TYPE_KEY: { [key in GENE_TYPE]: ExtractPathExpressions<Gene> } = {
  [GENE_TYPE.ONCOGENE]: 'type/ocg',
  [GENE_TYPE.TUMOR_SUPPRESSOR]: 'type/tsg',
};

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
  TREATMENTS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index/tumors/:index/TIs/:index/treatments/:index`,
  META_GENE: `${FB_COLLECTION.META}/:hugoSymbol`,
  META_GENE_REVIEW: `${FB_COLLECTION.META}/:hugoSymbol/review/:uuid`,
  META_COLLABORATORS: `${FB_COLLECTION.META}/collaborators`,
  META_COLLABORATOR: `${FB_COLLECTION.META}/collaborators/:name`,
  META_COLLABORATOR_GENE: `${FB_COLLECTION.META}/collaborators/:name/:index`,
  VUS: `${FB_COLLECTION.VUS}/:hugoSymbol`,
  HISTORY: `${FB_COLLECTION.HISTORY}/:hugoSymbol/api`,
  USERS: `${FB_COLLECTION.USERS}`,
};

export enum ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES {
  ONCOGENIC = 'oncogenic',
  LIKELY_ONCOGENIC = 'likely-oncogenic',
  RESISTANCE = 'resistance',
  LIKELY_NEUTRAL = 'likely-netrual',
  INCONCLUSIVE = 'inconclusive',
  UNKNOWN = 'unknown',
}

export const ONCOGENICITY_CLASS_MAPPING: { [key in FIREBASE_ONCOGENICITY]: string } = {
  [FIREBASE_ONCOGENICITY.YES]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.ONCOGENIC,
  [FIREBASE_ONCOGENICITY.LIKELY]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.LIKELY_ONCOGENIC,
  [FIREBASE_ONCOGENICITY.RESISTANCE]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.RESISTANCE,
  [FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.LIKELY_NEUTRAL,
  [FIREBASE_ONCOGENICITY.INCONCLUSIVE]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.INCONCLUSIVE,
  [FIREBASE_ONCOGENICITY.UNKNOWN]: ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES.UNKNOWN,
};

export const FIREBASE_ONCOGENICITY_MAPPING: { [key in FIREBASE_ONCOGENICITY]: string } = {
  [FIREBASE_ONCOGENICITY.YES]: ONCOGENICITY.ONCOGENIC,
  [FIREBASE_ONCOGENICITY.LIKELY]: ONCOGENICITY.LIKELY_ONCOGENIC,
  [FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL]: ONCOGENICITY.LIKELY_NEUTRAL,
  [FIREBASE_ONCOGENICITY.RESISTANCE]: ONCOGENICITY.RESISTANCE,
  [FIREBASE_ONCOGENICITY.UNKNOWN]: `${ONCOGENICITY.UNKNOWN} Oncogenic Effect`,
  [FIREBASE_ONCOGENICITY.INCONCLUSIVE]: ONCOGENICITY.INCONCLUSIVE,
};

/* Curation Page Constants */
export const ONCOGENICITY_OPTIONS = [
  FIREBASE_ONCOGENICITY.YES,
  FIREBASE_ONCOGENICITY.LIKELY,
  FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
  FIREBASE_ONCOGENICITY.INCONCLUSIVE,
  FIREBASE_ONCOGENICITY.RESISTANCE,
];

export const MUTATION_EFFECT_OPTIONS = [
  MUTATION_EFFECT.GAIN_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_GAIN_OF_FUNCTION,
  MUTATION_EFFECT.LOSS_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_LOSS_OF_FUNCTION,
  MUTATION_EFFECT.SWITCH_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_SWITCH_OF_FUNCTION,
  MUTATION_EFFECT.NEUTRAL,
  MUTATION_EFFECT.LIKELY_NEUTRAL,
  MUTATION_EFFECT.INCONCLUSIVE,
];

/**
 * We need this enum because FDA_LEVELS enum has the same value as TX_LEVELS enum.
 * We cannot directly change FDA_LEVELS.LEVEL_FDA1 to 'Fda1' because we don't want to update firebase yet.
 */
export enum FDA_LEVEL_KEYS {
  LEVEL_FDA1 = 'Fda1',
  LEVEL_FDA2 = 'Fda2',
  LEVEL_FDA3 = 'Fda3',
  LEVEL_FDA_NO = 'FdaNo',
}

export const FDA_LEVEL_KEYS_MAPPING: { [key in FDA_LEVEL_KEYS]: FDA_LEVELS } = {
  [FDA_LEVEL_KEYS.LEVEL_FDA1]: FDA_LEVELS.LEVEL_FDA1,
  [FDA_LEVEL_KEYS.LEVEL_FDA2]: FDA_LEVELS.LEVEL_FDA2,
  [FDA_LEVEL_KEYS.LEVEL_FDA3]: FDA_LEVELS.LEVEL_FDA3,
  [FDA_LEVEL_KEYS.LEVEL_FDA_NO]: FDA_LEVELS.LEVEL_FDA_NO,
};

export const THERAPEUTIC_SENSITIVE_LEVELS = [
  TX_LEVELS.LEVEL_1,
  TX_LEVELS.LEVEL_2,
  TX_LEVELS.LEVEL_3A,
  TX_LEVELS.LEVEL_3B,
  TX_LEVELS.LEVEL_4,
];

export const THERAPEUTIC_RESISTANCE_LEVELS = [TX_LEVELS.LEVEL_R1, TX_LEVELS.LEVEL_R2];

export const THERAPEUTIC_LEVELS_ORDERING = [
  TX_LEVELS.LEVEL_1,
  TX_LEVELS.LEVEL_R1,
  TX_LEVELS.LEVEL_2,
  TX_LEVELS.LEVEL_3A,
  TX_LEVELS.LEVEL_3B,
  TX_LEVELS.LEVEL_4,
  TX_LEVELS.LEVEL_R2,
];

export const PROGNOSTIC_LEVELS_ORDERING = [PX_LEVELS.LEVEL_PX1, PX_LEVELS.LEVEL_PX2, PX_LEVELS.LEVEL_PX3];

export const DIAGNOSTIC_LEVELS_ORDERING = [DX_LEVELS.LEVEL_DX1, DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX3];

export const FDA_LEVELS_ORDERING = [FDA_LEVEL_KEYS.LEVEL_FDA1, FDA_LEVEL_KEYS.LEVEL_FDA2, FDA_LEVEL_KEYS.LEVEL_FDA3];

export const ALL_LEVELS = [
  ...THERAPEUTIC_LEVELS_ORDERING,
  ...DIAGNOSTIC_LEVELS_ORDERING,
  ...PROGNOSTIC_LEVELS_ORDERING,
  ...FDA_LEVELS_ORDERING,
];

export const ALL_ONCOKB_LEVELS = [...THERAPEUTIC_LEVELS_ORDERING, ...DIAGNOSTIC_LEVELS_ORDERING, ...PROGNOSTIC_LEVELS_ORDERING];

export const TX_LEVEL_NO_DESCRIPTIONS = {
  [TX_LEVELS.LEVEL_NO]: 'No level',
  [TX_LEVELS.LEVEL_EMPTY]: 'No level',
};

export const TX_SENSITIVE_LEVEL_DESCRIPTIONS = {
  [TX_LEVELS.LEVEL_1]: 'FDA-recognized biomarker predictive of response to an FDA-approved drug in this indication',
  [TX_LEVELS.LEVEL_2]:
    'Standard care biomarker recommended by the NCCN or other expert panels predictive of response to an FDA-approved drug in this indication',
  [TX_LEVELS.LEVEL_3A]: 'Compelling clinical evidence supports the biomarker as being predictive of response to a drug in this indication',
  [TX_LEVELS.LEVEL_3B]:
    'Standard care or investigational biomarker predictive of response to an FDA-approved or investigational drug in another indication',
  [TX_LEVELS.LEVEL_4]: 'Compelling biological evidence supports the biomarker as being predictive of response to a drug',
};

export const TX_RESISTANCE_LEVEL_DESCRIPTIONS = {
  [TX_LEVELS.LEVEL_R1]: 'Standard care biomarker predictive of resistance to an FDA-approved drug in this indication',
  [TX_LEVELS.LEVEL_R2]: 'Compelling clinical evidence supports the biomarker as being predictive of resistance to a drug',
};

export const TX_LEVEL_DESCRIPTIONS: { [key in TX_LEVELS]: string } = {
  ...TX_SENSITIVE_LEVEL_DESCRIPTIONS,
  ...TX_RESISTANCE_LEVEL_DESCRIPTIONS,
  ...TX_LEVEL_NO_DESCRIPTIONS,
};

export const PX_LEVEL_DESCRIPTIONS: { [key in PX_LEVELS]: string } = {
  [PX_LEVELS.LEVEL_PX1]:
    'FDA and/or professional guideline-recognized biomarker prognostic in this indication based on well-powered studie(s)',
  [PX_LEVELS.LEVEL_PX2]:
    'FDA and/or professional guideline-recognized biomarker prognostic in this indication based on a single or multiple small studies',
  [PX_LEVELS.LEVEL_PX3]: 'Biomarker is prognostic in this indication based on clinical evidence in well-powered studies',
};

export const DX_LEVEL_DESCRIPTIONS: { [key in DX_LEVELS]: string } = {
  [DX_LEVELS.LEVEL_DX1]: 'FDA and/or professional guideline-recognized biomarker required for diagnosis in this indication',
  [DX_LEVELS.LEVEL_DX2]: 'FDA and/or professional guideline-recognized biomarker that supports diagnosis in this indication',
  [DX_LEVELS.LEVEL_DX3]: 'Biomarker that may assist disease diagnosis in this indication based on clinical evidence',
};

export const FDA_LEVEL_DESCRIPTIONS: { [key in FDA_LEVEL_KEYS]: string } = {
  [FDA_LEVEL_KEYS.LEVEL_FDA1]: 'Companion Diagnostics',
  [FDA_LEVEL_KEYS.LEVEL_FDA2]: 'Cancer Mutations with Evidence of Clinical Significance',
  [FDA_LEVEL_KEYS.LEVEL_FDA3]: 'Cancer Mutations with Potential of Clinical Significance',
  [FDA_LEVEL_KEYS.LEVEL_FDA_NO]: 'No level',
};

export const ALL_LEVEL_DESCRIPTIONS = {
  ...TX_LEVEL_DESCRIPTIONS,
  ...DX_LEVEL_DESCRIPTIONS,
  ...PX_LEVEL_DESCRIPTIONS,
  ...FDA_LEVEL_DESCRIPTIONS,
};

export const TX_LEVEL_OPTIONS = [
  TX_LEVELS.LEVEL_1,
  TX_LEVELS.LEVEL_2,
  TX_LEVELS.LEVEL_3A,
  TX_LEVELS.LEVEL_3B,
  TX_LEVELS.LEVEL_4,
  TX_LEVELS.LEVEL_R1,
  TX_LEVELS.LEVEL_R2,
  TX_LEVELS.LEVEL_NO,
];

export enum HISTORY_LOCATION_STRINGS {
  GENE_SUMMARY = 'Gene Summary',
  GENE_BACKGROUND = 'Gene Background',
  GENE_TYPE = 'Gene Type',
  MUTATION_EFFECT = 'Mutation Effect',
  TUMOR_TYPE_SUMMARY = 'Tumor Type Summary',
  PROGNOSTIC_SUMMARY = 'Prognostic Summary',
  DIAGNOSTIC_SUMMARY = 'Diagnostic Summary',
  PROGNOSTIC = 'Prognostic',
  DIAGNOSTIC = 'Diagnostic',
}

export enum ReviewAction {
  CREATE,
  DELETE,
  UPDATE,
  NAME_CHANGE,
}

export const ReviewActionToHistoryOperationMapping: { [key in ReviewAction]?: HistoryOperationType } = {
  [ReviewAction.CREATE]: HistoryOperationType.ADD,
  [ReviewAction.DELETE]: HistoryOperationType.DELETE,
  [ReviewAction.UPDATE]: HistoryOperationType.UPDATE,
  [ReviewAction.NAME_CHANGE]: HistoryOperationType.NAME_CHANGE,
};

export const ReviewActionLabels: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: 'Created',
  [ReviewAction.DELETE]: 'Deleted',
  [ReviewAction.UPDATE]: 'Updated',
  [ReviewAction.NAME_CHANGE]: 'Updated',
};

export const TI_TYPE_TO_HISTORY_STRING: { [key in TI_TYPE]: string } = {
  [TI_TYPE.SS]: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
  [TI_TYPE.SR]: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
  [TI_TYPE.IS]: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
  [TI_TYPE.IR]: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
};

export enum ReviewLevelType {
  META, // This means that the review level is used for grouping purposes
  REVIEWABLE, // This means that the review level has reviewable content
}

export const tooManyRCTsText = 'This cancer type contains too many RCTs. Please modify the excluding cancer types instead.';
