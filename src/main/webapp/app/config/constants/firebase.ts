import { Gene, FIREBASE_ONCOGENICITY, TX_LEVELS, TI_TYPE, HistoryOperationType } from 'app/shared/model/firebase/firebase.model';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { MUTATION_EFFECT, ONCOGENICITY } from './constants';

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

export const ONCOGENICITY_CLASS_MAPPING: { [key in FIREBASE_ONCOGENICITY]: string } = {
  [FIREBASE_ONCOGENICITY.YES]: 'oncogenic',
  [FIREBASE_ONCOGENICITY.LIKELY]: 'likely-oncogenic',
  [FIREBASE_ONCOGENICITY.RESISTANCE]: 'resistance',
  [FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL]: 'likely-neutral',
  [FIREBASE_ONCOGENICITY.INCONCLUSIVE]: 'inconclusive',
  [FIREBASE_ONCOGENICITY.UNKNOWN]: 'unknown',
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

export const TX_LEVEL_OPTIONS = [
  TX_LEVELS.LEVEL_1,
  TX_LEVELS.LEVEL_2,
  TX_LEVELS.LEVEL_3A,
  TX_LEVELS.LEVEL_3B,
  TX_LEVELS.LEVEL_4,
  TX_LEVELS.LEVEL_R1,
  TX_LEVELS.LEVEL_R2,
  TX_LEVELS.LEVEL_R3,
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
