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
  Gene,
  GeneType,
  GenomicIndicator,
  Implication,
  Mutation,
  MutationEffect,
  MutationSpecificInheritanceMechanism,
  MutationSpecificPenetrance,
  PX_LEVELS,
  TI_NAME,
  TI_TYPE,
  Treatment,
  Tumor,
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
  name_comments?: Comment[] = [];
  background = '';
  background_review?: Review;
  background_uuid: string = generateUuid();
  background_comments?: Comment[] = [];
  dmp_refseq_id = '';
  isoform_override = '';
  mutations: CoreSubmissionMutation[] = [];
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
  genomic_indicators: CoreSubmissionGenomicIndicator[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

export class CoreSubmissionMutation {
  mutation_effect: MutationEffect = new MutationEffect();
  mutation_effect_uuid: string = generateUuid();
  mutation_effect_comments?: Comment[] = []; // used for somatic
  name: string = '';
  name_comments?: Comment[] = [];
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
  cancerTypes_comments?: Comment[] = [];
  excludedCancerTypes?: CancerType[] = [];
  excludedCancerTypes_review?: Review;
  excludedCancerTypes_uuid?: string = generateUuid();
  diagnostic: CoreSubmissionImplication = new CoreSubmissionImplication();
  diagnosticSummary = '';
  diagnosticSummary_uuid: string = generateUuid();
  diagnostic_comments?: Comment[] = [];
  diagnostic_uuid: string = generateUuid();
  prognostic: CoreSubmissionImplication = new CoreSubmissionImplication();
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

/**
 * When converting from firebase model to core submission model, we want to remove any keys that are not present (optional) in
 * firebase model.
 * @param target The CoreSubmission model
 * @param source The Firebase model
 * @param skipKeys Keys of firebase arrays to skip
 */
function pruneOptionalKeysFromTarget<T extends object, S extends object>(target: T, source: S, skipKeys: string[] = []): void {
  for (const key of Object.keys(target)) {
    if (skipKeys.includes(key)) continue;

    if (!(key in source) || source[key] === undefined) {
      delete target[key];
    } else {
      target[key] = source[key];
    }
  }
}

/**
 * Assign values from firebase model to core submission model
 * @param target The CoreSubmission model
 * @param source The Firebase model
 * @param skipKeys Keys of firebase arrays to skip
 */
function migrateValuesToTarget<T extends object, S extends object>(target: T, source: S, skipKeys: string[] = []): void {
  for (const key of Object.keys(source)) {
    if (skipKeys.includes(key)) continue;
    if (key.endsWith('_comments')) {
      target[key] = Object.values(source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

/**
 * Transform a Gene object to a CoreSubmissionGene object
 * @param gene The Gene object to transform
 * @returns A CoreSubmissionGene object
 */
export function transformGeneToCoreSubmissionGene(gene: Gene): CoreSubmissionGene {
  const coreSubmissionGene = new CoreSubmissionGene(gene.name);

  const keysOfArrays: (keyof Gene)[] = ['mutations', 'genomic_indicators'];
  pruneOptionalKeysFromTarget(coreSubmissionGene, gene, keysOfArrays);
  migrateValuesToTarget(coreSubmissionGene, gene, keysOfArrays);

  if (gene.mutations) {
    coreSubmissionGene.mutations = Object.values(gene.mutations).map(mutation => transformMutationToCoreSubmissionMutation(mutation));
  }
  if (gene.genomic_indicators) {
    coreSubmissionGene.genomic_indicators = Object.values(gene.genomic_indicators ?? {}).map(indicator =>
      transformGenomicIndicatorToCoreSubmissionGenomicIndicator(indicator),
    );
  }
  return coreSubmissionGene;
}

/**
 * Transform a Mutation object to a CoreSubmissionMutation object
 */
function transformMutationToCoreSubmissionMutation(mutation: Mutation): CoreSubmissionMutation {
  const coreSubmissionMutation = new CoreSubmissionMutation(mutation.name);

  const keysOfArrays: (keyof Mutation)[] = ['tumors'];
  pruneOptionalKeysFromTarget(coreSubmissionMutation, mutation, keysOfArrays);
  migrateValuesToTarget(coreSubmissionMutation, mutation, keysOfArrays);

  if (mutation.tumors) {
    coreSubmissionMutation.tumors = Object.values(mutation.tumors).map(tumor => transformTumorToCoreSubmissionTumor(tumor));
  }

  return coreSubmissionMutation;
}

/**
 * Transform a Tumor object to a CoreSubmissionTumor object
 */
function transformTumorToCoreSubmissionTumor(tumor: Tumor): CoreSubmissionTumor {
  const coreSubmissionTumor = new CoreSubmissionTumor();

  const keysToSkip: (keyof Tumor)[] = ['TIs', 'cancerTypes', 'excludedCancerTypes', 'diagnostic', 'prognostic'];
  pruneOptionalKeysFromTarget(coreSubmissionTumor, tumor, keysToSkip);
  migrateValuesToTarget(coreSubmissionTumor, tumor, keysToSkip);

  if (tumor.TIs) {
    coreSubmissionTumor.TIs = tumor.TIs.map(ti => {
      const newTi = new TI(ti.type!);
      newTi.name = ti.name;
      newTi.name_uuid = ti.name_uuid;
      newTi.treatments_uuid = ti.treatments_uuid;
      if (ti.treatments) {
        newTi.treatments = Object.values(ti.treatments).map(treatment => transformTreatmentToCoreSubmissionTreatment(treatment));
      }
      return newTi;
    });
  }

  if (tumor.cancerTypes) {
    coreSubmissionTumor.cancerTypes = Object.values(tumor.cancerTypes);
  }

  if (tumor.excludedCancerTypes) {
    coreSubmissionTumor.excludedCancerTypes = Object.values(tumor.excludedCancerTypes);
  } else {
    delete coreSubmissionTumor.excludedCancerTypes;
  }

  if (tumor.diagnostic) {
    coreSubmissionTumor.diagnostic = transformImplicationToCoreSubmissionImplication(tumor.diagnostic);
  }
  if (tumor.prognostic) {
    coreSubmissionTumor.prognostic = transformImplicationToCoreSubmissionImplication(tumor.prognostic);
  }

  return coreSubmissionTumor;
}

/**
 * Transform a Treatment object to a CoreSubmissionTreatment object
 */
function transformTreatmentToCoreSubmissionTreatment(treatment: Treatment): CoreSubmissionTreatment {
  const coreSubmissionTreatment = new CoreSubmissionTreatment(treatment.name);

  const keysToSkip: (keyof Treatment)[] = ['excludedRCTs'];
  pruneOptionalKeysFromTarget(coreSubmissionTreatment, treatment, keysToSkip);
  migrateValuesToTarget(coreSubmissionTreatment, treatment, keysToSkip);

  if (treatment.excludedRCTs) {
    coreSubmissionTreatment.excludedRCTs = Object.values(treatment.excludedRCTs);
  } else {
    delete coreSubmissionTreatment.excludedRCTs;
  }

  return coreSubmissionTreatment;
}

/**
 * Transform an Implication object to a CoreSubmissionImplication object
 */
function transformImplicationToCoreSubmissionImplication(implication: Implication): CoreSubmissionImplication {
  const coreSubmissionImplication = new CoreSubmissionImplication();

  const keysToSkip: (keyof Implication)[] = ['excludedRCTs'];
  pruneOptionalKeysFromTarget(coreSubmissionImplication, implication, keysToSkip);
  migrateValuesToTarget(coreSubmissionImplication, implication, keysToSkip);

  if (implication.excludedRCTs) {
    coreSubmissionImplication.excludedRCTs = Object.values(implication.excludedRCTs);
  } else {
    delete coreSubmissionImplication.excludedRCTs;
  }

  return coreSubmissionImplication;
}

/**
 * Transform a GenomicIndicator object to a CoreSubmissionGenomicIndicator object
 */
function transformGenomicIndicatorToCoreSubmissionGenomicIndicator(indicator: GenomicIndicator): CoreSubmissionGenomicIndicator {
  const coreSubmissionIndicator = new CoreSubmissionGenomicIndicator();

  const keysToSkip: (keyof GenomicIndicator)[] = ['associationVariants'];
  pruneOptionalKeysFromTarget(coreSubmissionIndicator, indicator, keysToSkip);
  migrateValuesToTarget(coreSubmissionIndicator, indicator, keysToSkip);

  if (indicator.associationVariants) {
    coreSubmissionIndicator.associationVariants = Object.values(indicator.associationVariants);
  } else {
    delete coreSubmissionIndicator.associationVariants;
  }

  return coreSubmissionIndicator;
}
