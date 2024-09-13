import { GERMLINE_INHERITANCE_MECHANISM, PATHOGENICITY, PENETRANCE } from 'app/config/constants/constants';
import { ALLELE_STATE, GENE_TYPE, READABLE_FIELD } from 'app/config/constants/firebase';
import { AlterationTypeEnum, Gene as OncoKBGene } from 'app/shared/api/generated/curation';
import { generateUuid } from 'app/shared/util/utils';
import _ from 'lodash';
import { ICancerType } from '../cancer-type.model';

export type MetaCollection = {
  [hugoSymbol: string]: Meta;
} & {
  collaborators?: MetaCollaborators;
};

export type MetaCollaborators = {
  [name: string]: string[];
};

export type DrugCollection = {
  [uuid: string]: Drug;
};

export type VusObjList = {
  [uuid: string]: Vus;
};

export type HistoryCollection = {
  [hugoSymbol: string]: {
    api: HistoryList;
  };
};

export type HistoryList = {
  [uuid: string]: History;
};

export enum FIREBASE_ONCOGENICITY {
  YES = 'Yes',
  LIKELY = 'Likely',
  LIKELY_NEUTRAL = 'Likely Neutral',
  INCONCLUSIVE = 'Inconclusive',
  RESISTANCE = 'Resistance',
  UNKNOWN = 'Unknown',
}

export enum TX_LEVELS {
  LEVEL_EMPTY = '', // Empty string denotes that a level has not been selected yet
  LEVEL_NO = 'no', // No level is used by propagationSolid and propagationLiquid
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3A = '3A',
  LEVEL_3B = '3B',
  LEVEL_4 = '4',
  LEVEL_R1 = 'R1',
  LEVEL_R2 = 'R2',
}

export enum DX_LEVELS {
  LEVEL_DX1 = 'Dx1',
  LEVEL_DX2 = 'Dx2',
  LEVEL_DX3 = 'Dx3',
}

export enum PX_LEVELS {
  LEVEL_PX1 = 'Px1',
  LEVEL_PX2 = 'Px2',
  LEVEL_PX3 = 'Px3',
}

export enum FDA_LEVELS {
  LEVEL_FDA1 = 'Fda1',
  LEVEL_FDA2 = 'Fda2',
  LEVEL_FDA3 = 'Fda3',
  LEVEL_FDA_NO = 'no',
}

// In future, we want to remove the TI Types because they distinguishable
// by looking at the level.
export enum TI_TYPE {
  SS = 'SS',
  SR = 'SR',
  IS = 'IS',
  IR = 'IR',
}

export const TI_NAME: { [key in TI_TYPE]: string } = {
  [TI_TYPE.SS]: 'Standard implications for sensitivity to therapy',
  [TI_TYPE.SR]: 'Standard implications for resistance to therapy',
  [TI_TYPE.IS]: 'Investigational implications for sensitivity to therapy',
  [TI_TYPE.IR]: 'Investigational implications for resistance to therapy',
};

// We should convert boolean strings to actual booleans
export type BoolString = 'false' | 'true';

export class Treatment {
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
  indication = '';
  indication_uuid: string = generateUuid();
  level: TX_LEVELS = TX_LEVELS.LEVEL_EMPTY;
  level_review?: Review;
  level_uuid: string = generateUuid();
  fdaLevel: FDA_LEVELS = FDA_LEVELS.LEVEL_FDA_NO;
  fdaLevel_review?: Review;
  fdaLevel_uuid: string = generateUuid();
  name = '';
  name_comments?: Comment[] = [];
  name_review?: Review;
  name_uuid: string = generateUuid();
  propagation: TX_LEVELS = TX_LEVELS.LEVEL_EMPTY;
  propagationLiquid: TX_LEVELS = TX_LEVELS.LEVEL_EMPTY;
  propagationLiquid_uuid: string = generateUuid();
  propagation_review?: Review;
  propagation_uuid: string = generateUuid();
  excludedRCTs?: CancerType[] = [];
  excludedRCTs_review?: Review;
  excludedRCTs_uuid?: string = generateUuid();
  short = '';

  constructor(name: string) {
    this.name = name;
  }
}

export class GenomicIndicator {
  name = '';
  name_uuid: string = generateUuid();
  name_review?: Review;
  allele_state: AlleleState = new AlleleState();
  description = '';
  description_uuid = generateUuid();
  description_review?: Review;
  associationVariants?: { name: string; uuid: string }[] = [];
  associationVariants_uuid: string = generateUuid();
  associationVariants_review?: Review;
}

export class AlleleState {
  monoallelic: ALLELE_STATE.MONOALLELIC | '' = '';
  monoallelic_uuid = generateUuid();
  monoallelic_review?: Review;
  biallelic: ALLELE_STATE.BIALLELIC | '' = '';
  biallelic_uuid = generateUuid();
  biallelic_review?: Review;
  mosaic: ALLELE_STATE.MOSAIC | '' = '';
  mosaic_uuid = generateUuid();
  mosaic_review?: Review;
  carrier: ALLELE_STATE.CARRIER | '' = '';
  carrier_uuid = generateUuid();
  carrier_review?: Review;
}
export class Gene {
  name = '';
  name_comments?: Comment[] = [];
  background = '';
  background_review?: Review;
  background_uuid: string = generateUuid();
  background_comments?: Comment[] = [];
  dmp_refseq_id = '';
  isoform_override = '';
  mutations: Mutation[] = [];
  mutations_uuid: string = generateUuid();
  summary = '';
  summary_review?: Review;
  summary_uuid: string = generateUuid();
  summary_comments?: Comment[] = [];
  penetrance?: PENETRANCE | '' = '';
  penetrance_review?: Review;
  penetrance_uuid? = generateUuid();
  penetrance_comments?: Comment[] = [];
  inheritanceMechanism: `${GERMLINE_INHERITANCE_MECHANISM}` | '' = '';
  inheritanceMechanism_review?: Review;
  inheritanceMechanism_uuid: string = generateUuid();
  inheritanceMechanism_comments?: Comment[] = [];
  type: GeneType = new GeneType();
  type_uuid: string = generateUuid();
  dmp_refseq_id_grch38 = '';
  isoform_override_grch38 = '';

  // Germline
  genomic_indicators: GenomicIndicator[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

export class GeneType {
  ocg: typeof GENE_TYPE.ONCOGENE | '' = '';
  ocg_review?: Review;
  ocg_uuid: string = generateUuid();
  tsg: typeof GENE_TYPE.TUMOR_SUPPRESSOR | '' = '';
  tsg_uuid: string = generateUuid();
  tsg_review?: Review;
}

export class Alteration {
  type: AlterationTypeEnum = AlterationTypeEnum.Any;
  alteration = '';
  name = '';
  proteinChange = '';
  proteinStart?: number;
  proteinEnd?: number;
  refResidues = '';
  varResidues = '';
  consequence = '';
  comment = '';
  excluding: Alteration[] = [];
  genes: OncoKBGene[] = [];
}

export class Mutation {
  mutation_effect: MutationEffect = new MutationEffect();
  mutation_effect_uuid: string = generateUuid();
  mutation_effect_comments?: Comment[] = []; // used for somatic
  alteration_categories?: AlterationCategories | null;
  name: string = '';
  name_comments?: Comment[] = [];
  name_review?: Review;
  alterations?: Alteration[] = [];
  alterations_uuid?: string = generateUuid();
  alterations_review?: Review;
  name_uuid: string = generateUuid();
  tumors: Tumor[] = [];
  tumors_uuid: string = generateUuid();

  // Germline
  mutation_specific_penetrance = new MutationSpecificPenetrance();
  mutation_specific_inheritance_mechanism = new MutationSpecificInheritanceMechanism();
  mutation_specific_cancer_risk = new CancerRisk();

  constructor(name: string) {
    this.name = name;
  }
}

export type Flag = {
  type: string;
  flag: string;
};

export class AlterationCategories {
  flags?: Flag[];
  comment = '';
}

export class MutationEffect {
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
  effect = '';
  effect_review?: Review;
  effect_uuid: string = generateUuid();
  oncogenic: FIREBASE_ONCOGENICITY | '' = '';
  oncogenic_review?: Review;
  oncogenic_uuid: string = generateUuid();
  short = '';

  // Germline
  pathogenic: `${PATHOGENICITY}` | '' = '';
  pathogenic_review?: Review;
  pathogenic_uuid: string = generateUuid();
}

export class MutationSpecificPenetrance {
  penetrance: `${PENETRANCE}` | '' = '';
  penetrance_review?: Review;
  penetrance_uuid: string = generateUuid();
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
}

export class MutationSpecificInheritanceMechanism {
  inheritanceMechanism: `${GERMLINE_INHERITANCE_MECHANISM}` | '' = '';
  inheritanceMechanism_review?: Review;
  inheritanceMechanism_uuid: string = generateUuid();
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
}

export class CancerRisk {
  monoallelic = '';
  monoallelic_review?: Review;
  monoallelic_uuid: string = generateUuid();
  biallelic = '';
  biallelic_review?: Review;
  biallelic_uuid: string = generateUuid();
  mosaic = '';
  mosaic_review?: Review;
  mosaic_uuid: string = generateUuid();
}

export class Tumor {
  // We should remove this in future
  TIs: TI[] = [new TI(TI_TYPE.SS), new TI(TI_TYPE.SR), new TI(TI_TYPE.IS), new TI(TI_TYPE.IR)];
  cancerTypes: CancerType[] = [];
  cancerTypes_review?: Review;
  cancerTypes_uuid: string = generateUuid();
  cancerTypes_comments?: Comment[] = [];
  excludedCancerTypes?: CancerType[] = [];
  excludedCancerTypes_review?: Review;
  excludedCancerTypes_uuid?: string = generateUuid();
  diagnostic: Implication = new Implication();
  diagnosticSummary = '';
  diagnosticSummary_uuid: string = generateUuid();
  diagnostic_comments?: Comment[] = [];
  diagnostic_uuid: string = generateUuid();
  prognostic: Implication = new Implication();
  prognosticSummary = '';
  prognosticSummary_uuid: string = generateUuid();
  prognostic_comments?: Comment[] = [];
  prognostic_uuid: string = generateUuid();
  summary = '';
  summary_review?: Review;
  summary_uuid: string = generateUuid();
  diagnosticSummary_review?: Review;
  prognosticSummary_review?: Review;
}

export class TI {
  name = '';
  name_uuid: string = generateUuid();
  treatments: Treatment[] = [];
  treatments_uuid: string = generateUuid();
  type?: TI_TYPE;

  constructor(type: TI_TYPE) {
    this.type = type;
    this.name = TI_NAME[type];
  }
}

export class Implication {
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
  level: DX_LEVELS | PX_LEVELS | '' = '';
  level_review?: Review;
  level_uuid: string = generateUuid();
  excludedRCTs?: CancerType[] = [];
  excludedRCTs_review?: Review;
  excludedRCTs_uuid?: string = generateUuid();
  short = '';
}

export class CancerType {
  code? = '';
  mainType? = '';
  subtype? = '';
}

export class Drug {
  drugName = '';
  ncitCode = '';
  uuid: string = generateUuid();
  priority: number;
  description = '';
  ncitName = '';
  synonyms: string[] = [];

  constructor(drugName: string, ncitCode: string, ncitName: string, priority: number, synonyms: string[]) {
    this.drugName = drugName;
    this.ncitCode = ncitCode;
    this.ncitName = ncitName;
    this.priority = priority;
    this.synonyms = synonyms;
  }
}

export class Vus {
  name = '';
  name_comments?: Comment[] = [];
  time: VusTime;

  constructor(vusName: string, email: string, editorName: string) {
    this.name = vusName;
    this.time = new VusTime(email, editorName);
  }
}

export class VusTime {
  by: VusTimeBy;
  value: number = new Date().getTime();

  constructor(email: string, name: string) {
    this.by = new VusTimeBy(email, name);
  }
}

export class VusTimeBy {
  email = '';
  name = '';

  constructor(email: string, name: string) {
    this.email = email;
    this.name = name;
  }
}

export class Meta {
  lastModifiedBy = '';
  lastModifiedAt: string = new Date().getTime().toString();
  lastSavedAt?: number;
  lastSavedBy?: string;
  movingSection?: boolean;
  review?: MetaReview;
}

export class MetaReview {
  currentReviewer = '';
  [key: string]: string | boolean;
}

export class Comment {
  date: string = new Date().getTime().toString();
  userName = '';
  email = '';
  content = '';
  resolved: BoolString | boolean = false;
}

export class Review {
  updateTime: number;
  updatedBy = '';
  lastReviewed?: string | ICancerType[] | CancerType[];
  demotedToVus?: boolean;
  promotedToMutation?: boolean;
  // These three properties should not coexist
  added?: boolean;
  removed?: boolean;
  initialUpdate?: boolean; // Used for excludedRCTs review

  constructor(
    updatedBy: string,
    lastReviewed?: string | ICancerType[] | CancerType[],
    added?: boolean,
    removed?: boolean,
    initialUpdate?: boolean,
  ) {
    this.updatedBy = updatedBy;
    this.updateTime = new Date().getTime();
    if (!_.isNil(lastReviewed)) {
      this.lastReviewed = lastReviewed;
    }
    if (added) {
      this.added = added;
    }
    if (removed) {
      this.removed = removed;
    }
    if (initialUpdate) {
      this.initialUpdate = initialUpdate;
    }
  }
}

export class History {
  admin = '';
  records: HistoryRecord[] = [];
  timeStamp: number = new Date().getTime();

  constructor(admin: string, records?: HistoryRecord[], timestamp?: number) {
    this.admin = admin;
    if (records) {
      this.records = records;
    }
    if (timestamp) {
      this.timeStamp = timestamp;
    }
  }
}

export type HistoryRecordState =
  | string
  | Partial<Mutation>
  | Partial<Tumor>
  | Partial<Treatment>
  | Partial<Implication>
  | Partial<MutationEffect>;

export enum HistoryOperationType {
  ADD = 'add',
  DELETE = 'delete',
  UPDATE = 'update',
  NAME_CHANGE = 'name change',
  DEMOTE_MUTATION = 'demote',
  PROMOTE_VUS = 'promote',
}

export class HistoryRecord {
  lastEditBy = '';
  location = '';
  new?: HistoryRecordState = ''; // new is not required when operation is delete
  old?: HistoryRecordState = ''; // old is not required when operation is add
  operation: HistoryOperationType | '' = '';
  uuids? = ''; // This is a comma seperated string of uuids. This helps identify which fields under CREATE has been updated
  info?: HistoryInfo;
  ignoreNestedUpdates?: boolean;
}

export class HistoryInfo {
  mutation?: {
    uuid: string;
    name: string;
  };
  cancerType?: {
    uuid: string;
    name: string;
  };
  treatment?: {
    uuid: string;
    name: string;
  };
  fields?: READABLE_FIELD[];
}
