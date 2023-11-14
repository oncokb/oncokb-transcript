import { Gene } from 'app/shared/model/firebase/firebase.model';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';

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
  META_GENE: `${FB_COLLECTION.META}/:hugoSymbol`,
  META_GENE_REVIEW: `${FB_COLLECTION.META}/:hugoSymbol/review/:uuid`,
  META_COLLABORATORS: `${FB_COLLECTION.META}/collaborators`,
  META_COLLABORATOR: `${FB_COLLECTION.META}/collaborators/:name`,
  META_COLLABORATOR_GENE: `${FB_COLLECTION.META}/collaborators/:name/:index`,
};
