import { Gene, FIREBASE_ONCOGENICITY } from 'app/shared/model/firebase/firebase.model';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { ONCOGENICITY } from './constants';

export enum GENE_TYPE {
  TUMOR_SUPPRESSOR = 'Tumor Suppressor',
  ONCOGENE = 'Oncogene',
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
