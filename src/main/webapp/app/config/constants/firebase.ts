import {
  DX_LEVELS,
  FDA_LEVELS,
  FIREBASE_ONCOGENICITY,
  HistoryOperationType,
  PX_LEVELS,
  TI_TYPE,
  TX_LEVELS,
} from 'app/shared/model/firebase/firebase.model';
import { GERMLINE_INHERITANCE_MECHANISM, MUTATION_EFFECT, ONCOGENICITY, PATHOGENICITY, PENETRANCE } from './constants';

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

export const GENE_TYPE_KEY: { [key in GENE_TYPE]: string } = {
  [GENE_TYPE.ONCOGENE]: 'type/ocg',
  [GENE_TYPE.TUMOR_SUPPRESSOR]: 'type/tsg',
};

export enum FB_COLLECTION {
  DRUGS = 'Drugs',
  GENES = 'Genes',
  GERMLINE_GENES = 'Germline_Genes',
  HISTORY = 'History',
  GERMLINE_HISTORY = 'Germline_History',
  MAP = 'Map',
  META = 'Meta',
  GERMLINE_META = 'Germline_Meta',
  SETTING = 'Setting',
  VUS = 'VUS',
  GERMLINE_VUS = 'Germline_VUS',
}

export const FB_COLLECTION_PATH = {
  GENE: `${FB_COLLECTION.GENES}/:hugoSymbol`,
  GERMLINE_GENE: `${FB_COLLECTION.GERMLINE_GENES}/:hugoSymbol`,
  MUTATIONS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index`,
  TUMORS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index/tumors/:index`,
  TREATMENTS: `${FB_COLLECTION.GENES}/:hugoSymbol/mutations/:index/tumors/:index/TIs/:index/treatments/:index`,
  META_GENE: `${FB_COLLECTION.META}/:hugoSymbol`,
  GERMLINE_META_GENE: `${FB_COLLECTION.GERMLINE_META}/:hugoSymbol`,
  META_GENE_REVIEW: `${FB_COLLECTION.META}/:hugoSymbol/review/:uuid`,
  GERMLINE_META_GENE_REVIEW: `${FB_COLLECTION.GERMLINE_META}/:hugoSymbol/review/:uuid`,
  META_COLLABORATORS: `${FB_COLLECTION.META}/collaborators`,
  META_COLLABORATOR: `${FB_COLLECTION.META}/collaborators/:name`,
  META_COLLABORATOR_GENE: `${FB_COLLECTION.META}/collaborators/:name/:index`,
  VUS: `${FB_COLLECTION.VUS}/:hugoSymbol`,
  GERMLINE_VUS: `${FB_COLLECTION.GERMLINE_VUS}/:hugoSymbol`,
  HISTORY: `${FB_COLLECTION.HISTORY}/:hugoSymbol/api`,
  GERMLINE_HISTORY: `${FB_COLLECTION.GERMLINE_HISTORY}/:hugoSymbol/api`,
};

export enum ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES {
  ONCOGENIC = 'oncogenic',
  LIKELY_ONCOGENIC = 'likely-oncogenic',
  RESISTANCE = 'resistance',
  LIKELY_NEUTRAL = 'likely-neutral',
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

export const PENETRANCE_OPTIONS = [PENETRANCE.HIGH, PENETRANCE.INTERMEDIATE, PENETRANCE.LOW, PENETRANCE.OTHER];

export const INHERITANCE_MECHANISM_OPTIONS = [GERMLINE_INHERITANCE_MECHANISM.RECESSIVE, GERMLINE_INHERITANCE_MECHANISM.DOMINANT];

export const PATHOGENICITY_OPTIONS = [
  PATHOGENICITY.PATHOGENIC,
  PATHOGENICITY.LIKELY_PATHOGENIC,
  PATHOGENICITY.UNKNOWN,
  PATHOGENICITY.LIKELY_BENIGN,
  PATHOGENICITY.BENIGN,
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
  PENETRANCE = 'Penetrance',
  INHERITANCE_MECHANISM = 'Mechanism of Inheritance',
  MUTATION_SPECIFIC_PENETRANCE = 'Mutation Specific Penetrance',
  MUTATION_SPECIFIC_INHERITANCE_MECHANISM = 'Mutation Specific Inheritance Mechanism',
  MUTATION_SPECIFIC_CANCER_RISK = 'Mutation Specific Cancer Risk',
  RELEVANT_CANCER_TYPE = 'Relevant Cancer Types',
}

export enum ReviewAction {
  CREATE,
  DELETE,
  UPDATE,
  NAME_CHANGE,
  PROMOTE_VUS,
  DEMOTE_MUTATION,
}

export const ReviewActionToHistoryOperationMapping: { [key in ReviewAction]: HistoryOperationType } = {
  [ReviewAction.CREATE]: HistoryOperationType.ADD,
  [ReviewAction.DELETE]: HistoryOperationType.DELETE,
  [ReviewAction.UPDATE]: HistoryOperationType.UPDATE,
  [ReviewAction.NAME_CHANGE]: HistoryOperationType.NAME_CHANGE,
  [ReviewAction.PROMOTE_VUS]: HistoryOperationType.PROMOTE_VUS,
  [ReviewAction.DEMOTE_MUTATION]: HistoryOperationType.DEMOTE_MUTATION,
};

export const ReviewActionLabels: { [key in ReviewAction]: string } = {
  [ReviewAction.CREATE]: 'Created',
  [ReviewAction.DELETE]: 'Deleted',
  [ReviewAction.UPDATE]: 'Updated',
  [ReviewAction.NAME_CHANGE]: 'Updated',
  [ReviewAction.PROMOTE_VUS]: 'Promoted',
  [ReviewAction.DEMOTE_MUTATION]: 'Demoted',
};

export const TI_TYPE_TO_HISTORY_STRING: { [key in TI_TYPE]: string } = {
  [TI_TYPE.SS]: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
  [TI_TYPE.SR]: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
  [TI_TYPE.IS]: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
  [TI_TYPE.IR]: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
};

export const TI_TYPE_TO_LEGACY_HISTORY_STRING: { [key in TI_TYPE]: string } = {
  [TI_TYPE.SS]: 'Standard implications for sensitivity to therapy',
  [TI_TYPE.SR]: 'Standard implications for resistance to therapy',
  [TI_TYPE.IS]: 'Investigational implications for sensitivity to therapy',
  [TI_TYPE.IR]: 'Investigational implications for resistance to therapy',
};

export const ALL_TI_TYPE_HISTORY_STRINGS = [
  ...Object.values(TI_TYPE_TO_HISTORY_STRING),
  ...Object.values(TI_TYPE_TO_LEGACY_HISTORY_STRING),
];

export enum ReviewLevelType {
  META, // This means that the review level is used for grouping purposes
  REVIEWABLE, // This means that the review level has reviewable content
  REVIEWABLE_MULTI, // This means that the review level is displaying multi-selections (checkboxes)
}

export enum READABLE_FIELD {
  GENE_TYPE = 'Gene Type',
  TSG = 'Tumor Suppressor',
  OCG = 'Oncogene',
  SUMMARY = 'Summary',
  NAME = 'Name',
  BACKGROUND = 'Background',
  PENETRANCE = 'Penetrance',
  DESCRIPTION = 'Description',
  INHERITANCE_MECHANISM = 'Mechanism of Inheritance',
  CANCER_RISK = 'Cancer Risk',
  BIALLELIC = 'Biallelic',
  MONOALLELIC = 'Monoallelic',
  MOSAIC = 'Mosaic',
  DIAGNOSTIC = 'Diagnostic',
  PROGNOSTIC = 'Prognostic',
  DIAGNOSTIC_SUMMARY = 'Diagnostic Summary',
  PROGNOSTIC_SUMMARY = 'Prognostic Summary',
  MUTATION_EFFECT = 'Mutation Effect',
  PATHOGENIC = 'Pathogenic',
  ONCOGENIC = 'Oncogenic',
  EFFECT = 'Effect',
  MUTATION_SPECIFIC_PENETRANCE = 'Mutation Specific Penetrance',
  MUTATION_SPECIFIC_INHERITANCE = 'Mutation Specific Inheritance Mechanism',
  MUTATION_SPECIFIC_CANCER_RISK = 'Mutation Specific Cancer Risk',
  ADDITIONAL_INFORMATION = 'Additional Information',
  FDA_LEVEL = 'FDA Level',
  INDICATION = 'Indication',
  PROPAGATION = 'Propagation to Other Solid Tumor Types',
  PROPAGATION_LIQUID = 'Propagation to Other Liquid Tumor Types',
  LEVEL = 'Level',
  RCT = 'Relevant Cancer Types',
}

export const FIREBASE_KEY_TO_READABLE_FIELD: { [key: string]: READABLE_FIELD } = {
  type: READABLE_FIELD.GENE_TYPE,
  ocg: READABLE_FIELD.OCG,
  tsg: READABLE_FIELD.TSG,
  effect: READABLE_FIELD.EFFECT,
  mutation_effect: READABLE_FIELD.MUTATION_EFFECT,
  name: READABLE_FIELD.NAME,
  cancerTypes: READABLE_FIELD.NAME,
  mutation_specific_inheritance_mechanism: READABLE_FIELD.MUTATION_SPECIFIC_INHERITANCE,
  inheritanceMechanism: READABLE_FIELD.INHERITANCE_MECHANISM,
  description: READABLE_FIELD.DESCRIPTION,
  summary: READABLE_FIELD.SUMMARY,
  background: READABLE_FIELD.BACKGROUND,
  pathogenic: READABLE_FIELD.PATHOGENIC,
  mutation_specific_penetrance: READABLE_FIELD.MUTATION_SPECIFIC_PENETRANCE,
  penetrance: READABLE_FIELD.PENETRANCE,
  mutation_specific_cancer_risk: READABLE_FIELD.MUTATION_SPECIFIC_CANCER_RISK,
  cancerRisk: READABLE_FIELD.CANCER_RISK,
  biallelic: READABLE_FIELD.BIALLELIC,
  monoallelic: READABLE_FIELD.MONOALLELIC,
  mosaic: READABLE_FIELD.MOSAIC,
  oncogenic: READABLE_FIELD.ONCOGENIC,
  short: READABLE_FIELD.ADDITIONAL_INFORMATION,
  fdaLevel: READABLE_FIELD.FDA_LEVEL,
  indication: READABLE_FIELD.INDICATION,
  propagation: READABLE_FIELD.PROPAGATION,
  propagationLiquid: READABLE_FIELD.PROPAGATION_LIQUID,
  level: READABLE_FIELD.LEVEL,
  excludedRCTs: READABLE_FIELD.RCT,
  diagnostic: READABLE_FIELD.DIAGNOSTIC,
  diagnosticSummary: READABLE_FIELD.DIAGNOSTIC_SUMMARY,
  prognostic: READABLE_FIELD.PROGNOSTIC,
  prognosticSummary: READABLE_FIELD.PROGNOSTIC_SUMMARY,
};

export const HISTORY_OPERATION_TO_PAST_TENSE: { [operation in HistoryOperationType]: string } = {
  [HistoryOperationType.ADD]: 'Added',
  [HistoryOperationType.DELETE]: 'Deleted',
  [HistoryOperationType.NAME_CHANGE]: 'Name Changed',
  [HistoryOperationType.UPDATE]: 'Updated',
  [HistoryOperationType.DEMOTE_MUTATION]: 'Demoted',
  [HistoryOperationType.PROMOTE_VUS]: 'Promoted',
};

export const PATHOGENIC_VARIANTS = 'Pathogenic Variants';

export const AUTH_EMULATOR_URL = 'http://127.0.0.1:9099';
