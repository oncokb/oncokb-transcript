import { generateUuid } from 'app/shared/util/utils';

export enum TX_LEVELS {
  LEVEL_NO = 'no',
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3A = '3A',
  LEVEL_3B = '3B',
  LEVEL_4 = '4',
  LEVEL_R1 = 'R1',
  LEVEL_R2 = 'R2',
  LEVEL_R3 = 'R3',
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
  level: TX_LEVELS = TX_LEVELS.LEVEL_NO;
  level_review?: Review;
  level_uuid: string = generateUuid();
  name = '';
  name_review?: Review;
  name_uuid: string = generateUuid();
  propagation: TX_LEVELS = TX_LEVELS.LEVEL_NO;
  propagationLiquid: TX_LEVELS = TX_LEVELS.LEVEL_NO;
  propagationLiquid_uuid: string = generateUuid();
  propagation_review?: Review;
  propagation_uuid: string = generateUuid();
  short = '';

  constructor(name: string) {
    this.name = name;
  }
}

export class Gene {
  name = '';
  names_comments?: Comment[] = [];
  background = '';
  background_review?: Review;
  background_uuid: string = generateUuid();
  dmp_refseq_id = '';
  isoform_override = '';
  mutations: Mutation[] = [];
  mutations_uuid: string = generateUuid();
  summary = '';
  summary_review?: Review;
  summary_uuid: string = generateUuid();
  type: GeneType = new GeneType();
  type_uuid: string = generateUuid();
  dmp_refseq_id_grch38 = '';
  isoform_override_grch38 = '';

  constructor(name: string) {
    this.name = name;
  }
}

export class GeneType {
  ocg = '';
  ocg_review?: Review;
  ocg_uuid: string = generateUuid();
  tsg = '';
  tsg_uuid: string = generateUuid();
}

export class Mutation {
  mutation_effect: MutationEffect = new MutationEffect();
  mutation_effect_uuid: string = generateUuid();
  name = '';
  name_review?: Review;
  name_uuid: string = generateUuid();
  tumors: Tumor[] = [];
  tumors_uuid: string = generateUuid();
}

export class MutationEffect {
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
  effect = '';
  effect_review?: Review;
  effect_uuid: string = generateUuid();
  oncogenic = '';
  oncogenic_review?: Review;
  oncogenic_uuid: string = generateUuid();
  short = '';
}

export class Tumor {
  // We should remove this in future
  TIs: TI[] = [new TI(TI_TYPE.SS), new TI(TI_TYPE.SR), new TI(TI_TYPE.IS), new TI(TI_TYPE.IR)];
  cancerTypes: CancerType[] = [];
  cancerTypes_uuid: string = generateUuid();
  diagnostic: Implication = new Implication();
  diagnosticSummary = '';
  diagnosticSummary_uuid: string = generateUuid();
  diagnostic_uuid: string = generateUuid();
  prognostic: Implication = new Implication();
  prognosticSummary = '';
  prognosticSummary_uuid: string = generateUuid();
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
  short = '';
}

export class CancerType {
  code? = '';
  mainType? = '';
  subtype?: string;
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
  currentReview = '';
  [key: string]: string | boolean;
}

export class Comment {
  date: string = new Date().getTime().toString();
  userName = '';
  email = '';
  content = '';
  resolved: BoolString = 'false';
}

export class Review {
  updateTime: number;
  updatedBy = '';
  // These two properties should not coexist
  added?: boolean;
  removed?: boolean;

  constructor(updatedBy: string) {
    this.updatedBy = updatedBy;
    this.updateTime = new Date().getTime();
  }
}

export class History {
  admin = '';
  records: HistoryRecord[] = [];
  timeStamp = '';
}

export type HistoryRecordState = string | Tumor | Treatment | Implication;

export class HistoryRecord {
  lastEditBy = '';
  location = '';
  new: HistoryRecordState = '';
  old?: HistoryRecordState = '';
  operation = '';
  uuids = '';
}
