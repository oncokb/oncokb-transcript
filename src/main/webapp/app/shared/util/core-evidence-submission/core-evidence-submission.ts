import _ from 'lodash';
import { Drug, DrugCollection, Gene, Mutation, MutationEffect, TI, TX_LEVELS, Treatment, Tumor } from '../../model/firebase/firebase.model';
import { resolveTypeSpecificData } from './type-specific-resolvers';
import { FDA_LEVEL_MAPPING, LEVEL_MAPPING, collectUUIDs, getNewPriorities, validateTimeFormat } from './core-evidence-submission-utils';
import { Evidence, EvidenceEvidenceTypeEnum } from '../../api/generated/core/api';
import { useLastReviewedOnly } from '../core-submission-shared/core-submission-utils';

export type GetEvidenceArgs = {
  type: EvidenceEvidenceTypeEnum | 'MUTATION_NAME_CHANGE' | 'TUMOR_NAME_CHANGE' | 'TREATMENT_NAME_CHANGE';

  mutation: Mutation;
  tumor: Tumor;
  ti: TI;
  treatment: Treatment;
  gene: Gene;
  entrezGeneId: number | undefined;
  drugListRef: DrugCollection;
  updateTime: number;
};

export type KnownEffect = MutationEffect['oncogenic'] | 'Resistant' | 'Sensitive';

export function pathToDeleteEvidenceArgs({ valuePath, gene }: { valuePath: string; gene: Gene }): string[] | undefined {
  const { mutation, tumor, treatment } = extractObjsInValuePath(gene, valuePath);
  if (treatment !== undefined) {
    return collectUUIDs({ type: 'treatment', obj: treatment, uuidType: 'evidenceOnly' });
  } else if (tumor !== undefined) {
    return collectUUIDs({ type: 'tumor', obj: tumor, uuidType: 'evidenceOnly' });
  } else if (mutation !== undefined) {
    return collectUUIDs({ type: 'mutation', obj: mutation, uuidType: 'evidenceOnly' });
  } else {
    return undefined;
  }
}

export function pathToGetEvidenceArgs({
  gene: originalGene,
  valuePath,
  updateTime,
  drugListRef,
  entrezGeneId,
}: {
  valuePath: string;
} & Pick<GetEvidenceArgs, 'gene' | 'updateTime' | 'drugListRef' | 'entrezGeneId'>): GetEvidenceArgs | undefined {
  const gene = useLastReviewedOnly(originalGene);
  if (gene === undefined) {
    return undefined;
  }
  const args: Partial<GetEvidenceArgs> = {
    updateTime,
    gene,
    drugListRef,
    entrezGeneId,
    ...extractObjsInValuePath(gene, valuePath),
  };

  const tiRegex = /^mutations\/\d+\/tumors\/\d+\/TIs\/\d+\/treatments\/(\d+)(?!\/short$|\/indication$)/;

  let type: GetEvidenceArgs['type'] | undefined = undefined;

  if (valuePath === 'summary') {
    type = EvidenceEvidenceTypeEnum.GeneSummary;
  } else if (/^mutations\/\d+\/tumors\/\d+\/summary/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.TumorTypeSummary;
  } else if (/^mutations\/\d+\/tumors\/\d+\/prognosticSummary/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.PrognosticSummary;
  } else if (/^mutations\/\d+\/tumors\/\d+\/diagnosticSummary/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.DiagnosticSummary;
  } else if (valuePath === 'background') {
    type = EvidenceEvidenceTypeEnum.GeneBackground;
  } else if (/^mutations\/\d+\/mutation_effect\/(effect|description)/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.MutationEffect;
  } else if (/^mutations\/\d+\/tumors\/\d+\/prognostic\/.*/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.PrognosticImplication;
  } else if (/^mutations\/\d+\/tumors\/\d+\/diagnostic\/.*/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.DiagnosticImplication;
  } else if (/^mutations\/\d+\/mutation_effect\/oncogenic/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.Oncogenic;
  } else if (/^mutations\/\d+\/name/.test(valuePath)) {
    type = 'MUTATION_NAME_CHANGE';
  } else if (/^mutations\/\d+\/tumors\/\d+\/(cancerTypes|excludedCancerTypes)/.test(valuePath)) {
    type = 'TUMOR_NAME_CHANGE';
  } else if (/^mutations\/\d+\/tumors\/\d+\/TIs\/\d+\/treatments\/\d+\/name$/.test(valuePath)) {
    type = 'TREATMENT_NAME_CHANGE';
  } else if (tiRegex.test(valuePath)) {
    const treatmentIndex = +(tiRegex.exec(valuePath)?.[1] ?? 0);
    const level = args.ti?.treatments[treatmentIndex]?.level;

    switch (level) {
      case TX_LEVELS.LEVEL_1:
      case TX_LEVELS.LEVEL_2:
        type = EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity;
        break;
      case TX_LEVELS.LEVEL_3A:
      case TX_LEVELS.LEVEL_3B:
      case TX_LEVELS.LEVEL_4:
        type = EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugSensitivity;
        break;
      case TX_LEVELS.LEVEL_R1:
        type = EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugResistance;
        break;
      case TX_LEVELS.LEVEL_R2:
        type = EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugResistance;
        break;
      default:
        return undefined;
    }
  } else {
    // skipping
    // MutationSummary: 'MUTATION_SUMMARY',
    // TumorTypeSummary: 'TUMOR_TYPE_SUMMARY',
    // Vus: 'VUS',
    return undefined;
  }

  args.type = type;

  return args as GetEvidenceArgs;
}

function extractObjsInValuePath(gene: Gene, valuePath: string) {
  const args: Pick<Partial<GetEvidenceArgs>, 'mutation' | 'tumor' | 'ti' | 'treatment'> = {};
  let curObj: unknown = gene;
  let previousKey = '';
  for (const key of valuePath.split('/')) {
    const index = parseInt(key, 10);
    let propertyName = key;
    if (_.isObject(curObj) && key in curObj) {
      curObj = curObj[key];
    } else if (_.isArray(curObj)) {
      propertyName = previousKey;
      curObj = curObj[index];
      if (curObj === undefined) {
        throw new Error(`Could not find index "${key}" for the array "${previousKey}" in the value path "${valuePath}"`);
      }
    } else {
      throw new Error(`Could not find property "${key}" in the value path "${valuePath}"`);
    }

    if (_.isObject(curObj)) {
      if ('mutation_effect' in curObj) {
        args.mutation = curObj as Mutation;
      } else if ('cancerTypes' in curObj) {
        args.tumor = curObj as Tumor;
      } else if ('treatments' in curObj) {
        args.ti = curObj as TI;
      } else if ('indication' in curObj) {
        args.treatment = curObj as Treatment;
      }
    }

    previousKey = key;
  }
  return args;
}

export function getEvidence({
  type,
  mutation,
  tumor,
  ti,
  treatment,
  gene,
  drugListRef,
  updateTime,
  entrezGeneId,
}: GetEvidenceArgs): Record<string, Evidence> {
  const evidenceData = resolveTypeSpecificData({ type, entrezGeneId, gene, mutation, tumor, treatment, updateTime });

  if (ti && treatment) {
    handleTi({ treatment, evidenceData, ti, drugListRef, updateTime });
  }

  const evidences: Record<string, Evidence> = {};

  if (type === 'TREATMENT_NAME_CHANGE' || type === 'MUTATION_NAME_CHANGE' || type === 'TUMOR_NAME_CHANGE') {
    let uuids: string[];
    if (type === 'MUTATION_NAME_CHANGE') {
      uuids = collectUUIDs({ type: 'mutation', obj: mutation, uuidType: 'evidenceOnly' });
    } else if (type === 'TUMOR_NAME_CHANGE') {
      uuids = collectUUIDs({ type: 'tumor', obj: tumor, uuidType: 'evidenceOnly' });
    } else {
      uuids = collectUUIDs({ type: 'treatment', obj: treatment, uuidType: 'evidenceOnly' });
    }

    for (const uuid of uuids) {
      evidences[uuid] = evidenceData.data;
    }
  } else if (evidenceData.dataUUID) {
    evidences[evidenceData.dataUUID] = evidenceData.data;
  }

  return evidences;
}

function handleTi({
  evidenceData,
  treatment,
  ti,
  drugListRef,
  updateTime,
}: Pick<GetEvidenceArgs, 'treatment' | 'ti' | 'drugListRef' | 'updateTime'> & {
  evidenceData: ReturnType<typeof resolveTypeSpecificData>;
}) {
  evidenceData.dataUUID = treatment.name_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(updateTime);
  evidenceData.data.levelOfEvidence = LEVEL_MAPPING[treatment.level];
  evidenceData.data.description = treatment.description;
  evidenceData.data.solidPropagationLevel = LEVEL_MAPPING[treatment.propagation];
  evidenceData.data.liquidPropagationLevel = LEVEL_MAPPING[treatment.propagationLiquid];
  evidenceData.data.fdaLevel = FDA_LEVEL_MAPPING[treatment.fdaLevel];
  evidenceData.data.treatments = [];
  const treatments = treatment.name.split(',');
  const priorities = getNewPriorities(ti.treatments, [evidenceData.dataUUID]);

  for (let i = 0; i < treatments.length; i++) {
    const drugs = treatments[i].split('+');
    const drugList: Drug[] = [];
    for (let j = 0; j < drugs.length; j++) {
      const drugName = drugs[j].trim();
      const drugObj = drugListRef[drugName];
      if (drugObj) {
        drugObj.priority = j + 1;
        drugList.push(drugObj);
      } else {
        throw new Error('Drug is not available.' + drugName);
      }
    }
    evidenceData.data.treatments.push({
      approvedIndications: treatment.indication ? treatment.indication[treatment.indication] : [],
      drugs: drugList,
      priority: priorities[evidenceData.dataUUID][drugList.map(x => x.uuid).join(' + ')],
    });
  }
}
