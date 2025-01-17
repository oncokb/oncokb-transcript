import { GERMLINE_INHERITANCE_MECHANISM, PENETRANCE } from 'app/config/constants/constants';
import { generateUuid } from 'app/shared/util/utils';
import _ from 'lodash';
import {
  AlleleState,
  Alteration,
  AssociationVariant,
  CancerRisk,
  CancerType,
  CommentList,
  DX_LEVELS,
  FDA_LEVELS,
  GeneType,
  MutationEffect,
  MutationSpecificInheritanceMechanism,
  MutationSpecificPenetrance,
  PX_LEVELS,
  TI_NAME,
  TI_TYPE,
  TX_LEVELS,
} from './firebase.model';

/**
 * This file is a duplicate of `firebase.model.ts` with one key difference:
 *
 * In Firebase, lists are often stored as objects with generated keys (i.e., Record<string, T>)
 * to support efficient updates and indexing. However, in the context of core submissions,
 * these same lists are represented as regular JavaScript arrays (i.e., T[]) because core submission
 * logic is tightly coupled with the database structure
 *
 * IMPORTANT: Keep this file in sync with `firebase.model.ts` unless intentional differences are required.
 */

export class CoreSubmissionTreatment {
  description = '';
  description_review?: Review;
  description_uuid: string = generateUuid();
  indication = '';
  indication_review?: Review;
  indication_uuid: string = generateUuid();
  level: TX_LEVELS = TX_LEVELS.LEVEL_EMPTY;
  level_review?: Review;
  level_uuid: string = generateUuid();
  fdaLevel: FDA_LEVELS = FDA_LEVELS.LEVEL_FDA_NO;
  fdaLevel_review?: Review;
  fdaLevel_uuid: string = generateUuid();
  name = '';
  name_comments?: CommentList = {};
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

export class CoreSubmissionGenomicIndicator {
  name = '';
  name_uuid: string = generateUuid();
  name_review?: Review;
  allele_state: AlleleState = new AlleleState();
  description = '';
  description_uuid = generateUuid();
  description_review?: Review;
  associationVariants?: AssociationVariant[] = [];
  associationVariants_uuid: string = generateUuid();
  associationVariants_review?: Review;
}

export class CoreSubmissionGene {
  name = '';
  name_comments?: CommentList = {};
  background = '';
  background_review?: Review;
  background_uuid: string = generateUuid();
  background_comments?: CommentList = {};
  dmp_refseq_id = '';
  isoform_override = '';
  mutations: CoreSubmissionMutation[] = [];
  mutations_uuid: string = generateUuid();
  summary = '';
  summary_review?: Review;
  summary_uuid: string = generateUuid();
  summary_comments?: CommentList = {};
  penetrance?: PENETRANCE | '' = '';
  penetrance_review?: Review;
  penetrance_uuid? = generateUuid();
  penetrance_comments?: CommentList = {};
  inheritanceMechanism: `${GERMLINE_INHERITANCE_MECHANISM}` | '' = '';
  inheritanceMechanism_review?: Review;
  inheritanceMechanism_uuid: string = generateUuid();
  inheritanceMechanism_comments?: CommentList = {};
  type: GeneType = new GeneType();
  type_uuid: string = generateUuid();
  dmp_refseq_id_grch38 = '';
  isoform_override_grch38 = '';

  // Germline
  genomic_indicators: CoreSubmissionGenomicIndicator[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

export class CoreSubmissionMutation {
  mutation_effect: MutationEffect = new MutationEffect();
  mutation_effect_uuid: string = generateUuid();
  mutation_effect_comments?: CommentList = {}; // used for somatic
  name: string = '';
  name_comments?: CommentList = {};
  name_review?: Review;
  alterations?: Alteration[] = [];
  alterations_uuid?: string = generateUuid();
  alterations_review?: Review;
  name_uuid: string = generateUuid();
  tumors: CoreSubmissionTumor[] = [];
  tumors_uuid: string = generateUuid();
  summary = '';
  summary_review?: Review;
  summary_uuid: string = generateUuid();

  // Germline
  mutation_specific_penetrance = new MutationSpecificPenetrance();
  mutation_specific_inheritance_mechanism = new MutationSpecificInheritanceMechanism();
  mutation_specific_cancer_risk = new CancerRisk();

  constructor(name: string) {
    this.name = name;
  }
}

export class CoreSubmissionTumor {
  // We should remove this in future
  TIs: TI[] = [new TI(TI_TYPE.SS), new TI(TI_TYPE.SR), new TI(TI_TYPE.IS), new TI(TI_TYPE.IR)];
  cancerTypes: CancerType[] = [];
  cancerTypes_review?: Review;
  cancerTypes_uuid: string = generateUuid();
  cancerTypes_comments?: CommentList = {};
  excludedCancerTypes?: CancerType[] = [];
  excludedCancerTypes_review?: Review;
  excludedCancerTypes_uuid?: string = generateUuid();
  diagnostic: CoreSubmissionImplication = new CoreSubmissionImplication();
  diagnosticSummary = '';
  diagnosticSummary_uuid: string = generateUuid();
  diagnostic_comments?: CommentList = {};
  diagnostic_uuid: string = generateUuid();
  prognostic: CoreSubmissionImplication = new CoreSubmissionImplication();
  prognosticSummary = '';
  prognosticSummary_uuid: string = generateUuid();
  prognostic_comments?: CommentList = {};
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
  treatments: CoreSubmissionTreatment[] = [];
  treatments_uuid: string = generateUuid();
  type?: TI_TYPE;

  constructor(type: TI_TYPE) {
    this.type = type;
    this.name = TI_NAME[type];
  }
}

export class CoreSubmissionImplication {
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

export class Review {
  updateTime: number;
  updatedBy = '';
  lastReviewed?: string | CancerType[];
  demotedToVus?: boolean;
  promotedToMutation?: boolean;
  // These three properties should not coexist
  added?: boolean;
  removed?: boolean;
  initialUpdate?: boolean; // Used for excludedRCTs review

  constructor(updatedBy: string, lastReviewed?: string | CancerType[], added?: boolean, removed?: boolean, initialUpdate?: boolean) {
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
