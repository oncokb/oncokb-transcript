import _ from 'lodash';
import { Drug, DrugCollection, Gene, Mutation, MutationEffect, TI, TX_LEVELS, Treatment, Tumor } from '../../model/firebase/firebase.model';
import { resolveTypeSpecificData } from './type-specific-resolvers';
import { FDA_LEVEL_MAPPING, LEVEL_MAPPING, getNewPriorities, validateTimeFormat } from './core-submission-utils';
import { Evidence, EvidenceEvidenceTypeEnum } from '../../api/generated/core/api';

export type GetEvidenceArgs = {
  type: EvidenceEvidenceTypeEnum;
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

export function pathToGetEvidenceArgs({
  gene,
  valuePath,
  updateTime,
  drugListRef,
  entrezGeneId,
}: {
  valuePath: string;
} & Pick<GetEvidenceArgs, 'gene' | 'updateTime' | 'drugListRef' | 'entrezGeneId'>): GetEvidenceArgs | undefined {
  const args: Partial<GetEvidenceArgs> = {
    updateTime,
    gene,
    drugListRef,
    entrezGeneId,
  };

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
  const tiRegex = /^mutations\/\d+\/tumors\/\d+\/TIs\/\d+\/treatments\/(\d+)(?!\/short$|\/indication$|\/name_review$)/;
  let type: EvidenceEvidenceTypeEnum | undefined = undefined;
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
  } else if (/^mutations\/\d+\/tumors\/\d+\/prognostic\/level/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.PrognosticImplication;
  } else if (/^mutations\/\d+\/tumors\/\d+\/diagnostic\/level/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.DiagnosticImplication;
  } else if (/^mutations\/\d+\/mutation_effect\/oncogenic/.test(valuePath)) {
    type = EvidenceEvidenceTypeEnum.Oncogenic;
  } else if (tiRegex.test(valuePath)) {
    const treatmentIndex = +tiRegex.exec(valuePath)[1];
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

export function getEvidence({ type, mutation, tumor, ti, treatment, gene, drugListRef, updateTime, entrezGeneId }: GetEvidenceArgs) {
  const evidenceData = resolveTypeSpecificData({ type, entrezGeneId, gene, mutation, tumor, updateTime });

  if (TI && treatment) {
    handleTi({ treatment, evidenceData, ti, drugListRef, updateTime });
  }
  const evidences: Record<string, Evidence> = {};

  if (evidenceData.dataUUID) {
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
      approvedIndications: [treatment.indication],
      drugs: drugList,
      priority:
        priorities[evidenceData.dataUUID][
          drugList
            .map(function (drug) {
              return drug.drugName;
            })
            .join(' + ')
        ],
    });
  }
}
