import _ from 'lodash';
import { GetEvidenceArgs, KnownEffect } from './core-evidence-submission';
import { mostRecentItem, LEVEL_MAPPING, validateTimeFormat, collectUUIDs } from './core-evidence-submission-utils';
import { Alteration, Evidence, TumorType } from '../../api/generated/core/api';
import { Mutation } from 'app/shared/model/firebase/firebase.model';

function handleInvestigationalResistanceToTherapy({ evidenceData }: { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.knownEffect = 'Resistant';
}

function handleInvestigationalSensitivityToTherapy({ evidenceData }: { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.knownEffect = 'Sensitive';
}

function handleStandardResistanceToTherapy({ evidenceData }: { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.knownEffect = 'Resistant';
}

function handleStandardSensitivityToTherapy({ evidenceData }: { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.knownEffect = 'Sensitive';
}

function handleTherapyExcludedRCTs({
  evidenceData,
  treatment,
}: Pick<GetEvidenceArgs, 'treatment'> & { evidenceData: InitializeEvidenceDataRtn }) {
  if (treatment.excludedRCTs) {
    evidenceData.data.excludedCancerTypes = treatment.excludedRCTs as TumorType[];
  }
}

function handlePrognosticSummary({ tumor, evidenceData }: Pick<GetEvidenceArgs, 'tumor'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = tumor.prognosticSummary;
  evidenceData.dataUUID = tumor.prognosticSummary_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(tumor.prognosticSummary_review?.updateTime);
}

function handleDiagnosticSummary({ tumor, evidenceData }: Pick<GetEvidenceArgs, 'tumor'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = tumor.diagnosticSummary;
  evidenceData.dataUUID = tumor.diagnosticSummary_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(tumor.diagnosticSummary_review?.updateTime);
}

function handleTumorTypeSummary({ tumor, evidenceData }: Pick<GetEvidenceArgs, 'tumor'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = tumor.summary;
  evidenceData.dataUUID = tumor.summary_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(tumor.summary_review?.updateTime);
}

function handleOncogenic({ mutation, evidenceData }: Pick<GetEvidenceArgs, 'mutation'> & { evidenceData: InitializeEvidenceDataRtn }) {
  const MEObj = mutation.mutation_effect;
  evidenceData.data.evidenceType = 'ONCOGENIC';
  evidenceData.data.knownEffect = MEObj.oncogenic;
  evidenceData.dataUUID = MEObj.oncogenic_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(MEObj.oncogenic_review?.updateTime);
}

function handleMutationEffect({ mutation, evidenceData }: Pick<GetEvidenceArgs, 'mutation'> & { evidenceData: InitializeEvidenceDataRtn }) {
  const MEObj = mutation.mutation_effect;
  const tempReviewObjArr = [MEObj.effect_review, MEObj.description_review];
  const tempRecentIndex = mostRecentItem(tempReviewObjArr, true);
  evidenceData.data.knownEffect = MEObj.effect as KnownEffect;
  evidenceData.dataUUID = MEObj.effect_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(tempReviewObjArr[tempRecentIndex]?.updateTime);
  evidenceData.data.description = MEObj.description;
  evidenceData.data.evidenceType = 'MUTATION_EFFECT';
}

function handleDiagnosticImplication({
  tumor,
  updateTime,
  evidenceData,
}: Pick<GetEvidenceArgs, 'tumor' | 'updateTime'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = tumor.diagnostic.description;
  evidenceData.data.levelOfEvidence = LEVEL_MAPPING[tumor.diagnostic.level];
  if (tumor.diagnostic.excludedRCTs) {
    evidenceData.data.excludedCancerTypes = tumor.prognostic.excludedRCTs as TumorType[];
  }
  evidenceData.dataUUID = tumor.diagnostic_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(updateTime);
}

function handlePrognosticImplication({
  tumor,
  updateTime,
  evidenceData,
}: Pick<GetEvidenceArgs, 'tumor' | 'updateTime'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = tumor.prognostic.description;
  evidenceData.data.levelOfEvidence = LEVEL_MAPPING[tumor.prognostic.level];
  if (tumor.prognostic.excludedRCTs) {
    evidenceData.data.excludedCancerTypes = tumor.prognostic.excludedRCTs as TumorType[];
  }
  evidenceData.dataUUID = tumor.prognostic_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(updateTime);
}

function handleGeneBackground({ gene, evidenceData }: Pick<GetEvidenceArgs, 'gene'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = gene.background;
  evidenceData.dataUUID = gene.background_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(gene.background_review?.updateTime);
}

function handleGeneSummary({ gene, evidenceData }: Pick<GetEvidenceArgs, 'gene'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.description = gene.summary;
  evidenceData.dataUUID = gene.summary_uuid;
  evidenceData.data.lastEdit = validateTimeFormat(gene.summary_review?.updateTime);
}

function handleMutationNameChange({
  evidenceData,
  gene,
  mutation,
}: Pick<GetEvidenceArgs, 'gene' | 'mutation'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.alterations = getAlterations(gene.name, mutation);
}

function handleMutationSummary({
  evidenceData,
  mutation,
}: Pick<GetEvidenceArgs, 'mutation'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.evidenceType = 'MUTATION_SUMMARY';
  evidenceData.dataUUID = mutation.summary_uuid;
  evidenceData.data.description = mutation.summary;
}

function handleTumorNameChange({ evidenceData, tumor }: Pick<GetEvidenceArgs, 'tumor'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.cancerTypes = tumor.cancerTypes as TumorType[];
  evidenceData.data.excludedCancerTypes = tumor.excludedCancerTypes as TumorType[];
}

function handleTreatmentNameChange({
  evidenceData,
  treatment,
}: Pick<GetEvidenceArgs, 'treatment'> & { evidenceData: InitializeEvidenceDataRtn }) {
  evidenceData.data.excludedCancerTypes = treatment.excludedRCTs as TumorType[];
}

type InitializeEvidenceDataRtn = {
  data: Evidence;
  dataUUID: string;
};

function initializeEvidenceData({
  type,
  gene,
  entrezGeneId,
}: Pick<GetEvidenceArgs, 'gene' | 'entrezGeneId' | 'type'>): InitializeEvidenceDataRtn {
  const data: Evidence = {
    additionalInfo: null,
    alterations: null,
    description: null,
    evidenceType: type === 'TUMOR_NAME_CHANGE' || type === 'MUTATION_NAME_CHANGE' || type === 'TREATMENT_NAME_CHANGE' ? null : type,
    gene: {
      hugoSymbol: gene.name,
    },
    knownEffect: null,
    lastEdit: null,
    levelOfEvidence: null,
    articles: null,
    treatments: null,
    solidPropagationLevel: null,
    liquidPropagationLevel: null,
    fdaLevel: null,
    cancerTypes: null,
    excludedCancerTypes: null,
    relevantCancerTypes: null,
  } as unknown as Evidence;

  if (data.gene !== undefined) {
    data.gene.entrezGeneId = entrezGeneId;
  }

  return {
    data,
    dataUUID: '',
  };
}

export function resolveTypeSpecificData({
  gene,
  type,
  tumor,
  mutation,
  updateTime,
  entrezGeneId,
  treatment,
}: Pick<GetEvidenceArgs, 'gene' | 'entrezGeneId' | 'type' | 'tumor' | 'mutation' | 'treatment' | 'updateTime'>) {
  const evidenceData = initializeEvidenceData({ type, gene, entrezGeneId });
  switch (type) {
    case 'GENE_SUMMARY':
      handleGeneSummary({ evidenceData, gene });
      break;
    case 'GENE_BACKGROUND':
      handleGeneBackground({ evidenceData, gene });
      break;
    case 'MUTATION_EFFECT':
      handleMutationEffect({ evidenceData, mutation });
      break;
    case 'TUMOR_TYPE_SUMMARY':
      handleTumorTypeSummary({ evidenceData, tumor });
      break;
    case 'DIAGNOSTIC_SUMMARY':
      handleDiagnosticSummary({ evidenceData, tumor });
      break;
    case 'PROGNOSTIC_SUMMARY':
      handlePrognosticSummary({ evidenceData, tumor });
      break;
    case 'PROGNOSTIC_IMPLICATION':
      handlePrognosticImplication({ evidenceData, tumor, updateTime });
      break;
    case 'DIAGNOSTIC_IMPLICATION':
      handleDiagnosticImplication({ evidenceData, tumor, updateTime });
      break;
    case 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY':
      handleStandardSensitivityToTherapy({ evidenceData });
      handleTherapyExcludedRCTs({ evidenceData, treatment });
      break;
    case 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE':
      handleStandardResistanceToTherapy({ evidenceData });
      handleTherapyExcludedRCTs({ evidenceData, treatment });
      break;
    case 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY':
      handleInvestigationalSensitivityToTherapy({ evidenceData });
      handleTherapyExcludedRCTs({ evidenceData, treatment });
      break;
    case 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE':
      handleInvestigationalResistanceToTherapy({ evidenceData });
      handleTherapyExcludedRCTs({ evidenceData, treatment });
      break;
    case 'ONCOGENIC':
      handleOncogenic({ mutation, evidenceData });
      break;
    case 'MUTATION_NAME_CHANGE':
      handleMutationNameChange({ evidenceData, gene, mutation });
      break;
    case 'MUTATION_SUMMARY':
      handleMutationSummary({ evidenceData, mutation });
      break;
    case 'TUMOR_NAME_CHANGE':
      handleTumorNameChange({ evidenceData, tumor });
      break;
    case 'TREATMENT_NAME_CHANGE':
      handleTreatmentNameChange({ evidenceData, treatment });
      break;
    default:
      throw new Error(`Unknown evidence type "${type}"`);
  }

  if (evidenceData.data.evidenceType) {
    // attach alterations when available, so we can create new evidence if it does not exist in server side
    if (mutation) {
      if (!evidenceData.data.alterations) {
        evidenceData.data.alterations = getAlterations(gene.name, mutation);
      }
    }
    if (tumor) {
      if (!evidenceData.data.cancerTypes) {
        evidenceData.data.cancerTypes = tumor.cancerTypes as TumorType[];
      }
      if (!evidenceData.data.excludedCancerTypes) {
        evidenceData.data.excludedCancerTypes = tumor.excludedCancerTypes as TumorType[];
      }
    }
  }

  if (!evidenceData.data.cancerTypes) {
    evidenceData.data.cancerTypes = [];
  }
  if (!evidenceData.data.relevantCancerTypes) {
    evidenceData.data.relevantCancerTypes = [];
  }
  if (!evidenceData.data.excludedCancerTypes) {
    evidenceData.data.excludedCancerTypes = [];
  }

  return evidenceData;
}

function getAlterations(geneName: string, mutation: Mutation) {
  const alterations = mutation.alterations;
  const altResults: Alteration[] = [];
  if (mutation.name && (alterations === undefined || alterations.length === 0)) {
    altResults.push({
      alteration: mutation.name.trim(),
      gene: {
        hugoSymbol: geneName,
      },
    });
  } else if (alterations !== undefined && alterations.length > 0) {
    for (const alteration of alterations) {
      altResults.push({
        alteration: alteration.name,
        gene: {
          hugoSymbol: geneName,
        },
      });
    }
  }

  return altResults;
}
