import _ from 'lodash';
import { GetEvidenceArgs, KnownEffect } from './core-submission';
import { mostRecentItem, LEVEL_MAPPING, validateTimeFormat } from './core-submission-utils';
import { Evidence } from '../../api/generated/core/api';

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
  evidenceData.data.lastEdit = validateTimeFormat(tempReviewObjArr[tempRecentIndex].updateTime);
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
    alterations: [],
    description: null,
    evidenceType: type,
    gene: {
      hugoSymbol: gene.name,
    },
    knownEffect: null,
    lastEdit: null,
    levelOfEvidence: null,
    articles: null,
    treatments: [],
    solidPropagationLevel: null,
    liquidPropagationLevel: null,
    fdaLevel: null,
    cancerTypes: [],
    excludedCancerTypes: [],
    relevantCancerTypes: [],
  };

  data.gene.entrezGeneId = entrezGeneId;

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
}: Pick<GetEvidenceArgs, 'gene' | 'entrezGeneId' | 'type' | 'tumor' | 'mutation' | 'updateTime'>) {
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
      break;
    case 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE':
      handleStandardResistanceToTherapy({ evidenceData });
      break;
    case 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY':
      handleInvestigationalSensitivityToTherapy({ evidenceData });
      break;
    case 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE':
      handleInvestigationalResistanceToTherapy({ evidenceData });
      break;
    case 'ONCOGENIC':
      handleOncogenic({ mutation, evidenceData });
      break;
    default:
      throw new Error(`Unknown evidence type "${type}"`);
  }
  return evidenceData;
}
