import { evidenceClient } from 'app/shared/api/clients';
import React, { useState } from 'react';
import Select, { GroupBase } from 'react-select';
import { Evidence, EvidenceEvidenceTypeEnum, Treatment, TreatmentDrug } from 'app/shared/api/generated/core';
import { downloadFile } from 'app/shared/util/file-utils';
import _ from 'lodash';
import { convertOncoKbTumorTypeToCancerType, getCancerTypesName, getCancerTypesNameWithExclusion } from 'app/shared/util/utils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { getValueByNestedKey } from 'app/shared/util/firebase/firebase-utils';

type EvidenceMapping =
  | {
      header: string;
      accessor: string | ((...args: any[]) => string);
      value?: string;
      isGroupingField: true;
      evidenceTypes?: undefined;
    }
  | {
      header: string;
      accessor: string | ((...args: any[]) => string);
      value?: string;
      isGroupingField?: false | undefined;
      evidenceTypes: EvidenceEvidenceTypeEnum[];
    };

const HUGOSYMBOL_EVIDENCE_MAPPING: EvidenceMapping = {
  header: 'Hugo Symbol',
  accessor: 'gene.hugoSymbol',
  isGroupingField: true,
};
const ALTERATION_EVIDENCE_MAPPING: EvidenceMapping = {
  header: 'Alteration',
  accessor: 'alterations.0.alteration',
  isGroupingField: true,
};
const TUMORTYPE_EVIDENCE_MAPPING: EvidenceMapping = {
  header: 'Cancer Type',
  accessor: getCancerTypeNameFromEvidence,
  isGroupingField: true,
};
const DRUG_NAME_EVIDENCE_MAPPING: EvidenceMapping = {
  header: 'Drug(s)',
  accessor: getDrugsNameFromEvidence,
  isGroupingField: true,
};
const EVIDENCE_ID_EVIDENCE_MAPPING: EvidenceMapping = {
  header: 'Evidence ID',
  accessor: 'id',
  isGroupingField: true,
};

type GeneLevelKeys = 'hugoSymbol' | 'geneSummary' | 'geneBackground' | 'geneType';
const GeneLevelEvidence: Record<GeneLevelKeys, EvidenceMapping> = {
  hugoSymbol: HUGOSYMBOL_EVIDENCE_MAPPING,
  geneSummary: {
    header: 'Gene Summary',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GeneSummary],
  },
  geneBackground: {
    header: 'Gene Background',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GeneBackground],
  },
  geneType: {
    header: 'Gene Type',
    accessor: 'gene.geneType',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GeneSummary], // There is no specific evidence type for gene type, so we use GENE_SUMMARY
  },
};

type MutationLevelKeys = 'hugoSymbol' | 'alteration' | 'oncogenicity' | 'pathogenicity' | 'mutationEffect' | 'mutationEffectDescription';
const MutationLevelEvidence: Record<MutationLevelKeys, EvidenceMapping> = {
  hugoSymbol: HUGOSYMBOL_EVIDENCE_MAPPING,
  alteration: ALTERATION_EVIDENCE_MAPPING,
  oncogenicity: {
    header: 'Oncogenicity',
    accessor: 'knownEffect',
    evidenceTypes: [EvidenceEvidenceTypeEnum.Oncogenic],
  },
  pathogenicity: {
    header: 'Pathogenicity',
    accessor: 'knownEffect',
    evidenceTypes: [EvidenceEvidenceTypeEnum.Pathogenic],
  },
  mutationEffect: {
    header: 'Mutation Effect',
    accessor: 'knownEffect',
    evidenceTypes: [EvidenceEvidenceTypeEnum.MutationEffect],
  },
  mutationEffectDescription: {
    header: 'Mutation Effect Description',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.MutationEffect],
  },
};

type MutationLevelOptionKey = Exclude<MutationLevelKeys, 'hugoSymbol' | 'alteration'>;

const MUTATION_LEVEL_SOMATIC_KEYS: MutationLevelOptionKey[] = ['oncogenicity', 'mutationEffect', 'mutationEffectDescription'];
const MUTATION_LEVEL_GERMLINE_KEYS: MutationLevelOptionKey[] = ['pathogenicity', 'mutationEffect', 'mutationEffectDescription'];

type GenomicIndicatorLevelKeys = 'hugoSymbol' | 'name' | 'inheritanceMechanism' | 'description' | 'associatedVariants';
const GenomicIndicatorLevelEvidence: Record<GenomicIndicatorLevelKeys, EvidenceMapping> = {
  hugoSymbol: HUGOSYMBOL_EVIDENCE_MAPPING,
  name: {
    header: 'Name',
    accessor: 'name',
    isGroupingField: true,
  },
  inheritanceMechanism: {
    header: 'Inheritance Mechanism',
    accessor: 'knownEffect',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GenomicIndicator],
  },
  description: {
    header: 'Description',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GenomicIndicator],
  },
  associatedVariants: {
    header: 'Associated Variants',
    accessor: getAssociatedVariantsFromEvidence,
    evidenceTypes: [EvidenceEvidenceTypeEnum.GenomicIndicator],
  },
};

type GenomicIndicatorLevelOptionKey = Exclude<GenomicIndicatorLevelKeys, 'hugoSymbol' | 'name'>;
const GENOMIC_INDICATOR_LEVEL_KEYS: GenomicIndicatorLevelOptionKey[] = ['inheritanceMechanism', 'description', 'associatedVariants'];

type TumorLevelKeys =
  | 'hugoSymbol'
  | 'alteration'
  | 'tumorType'
  | 'tumorTypeSummary'
  | 'diagnosticSummary'
  | 'prognosticSummary'
  | 'diagnosticLevel'
  | 'diagnosticDescription'
  | 'prognosticLevel'
  | 'prognosticImplication';
const TumorLevelEvidence: Record<TumorLevelKeys, EvidenceMapping> = {
  hugoSymbol: HUGOSYMBOL_EVIDENCE_MAPPING,
  alteration: ALTERATION_EVIDENCE_MAPPING,
  tumorType: TUMORTYPE_EVIDENCE_MAPPING,
  tumorTypeSummary: {
    header: 'Tumor Type Summary',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.TumorTypeSummary],
  },
  diagnosticSummary: {
    header: 'Diagnostic Summary',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.DiagnosticSummary],
  },
  prognosticSummary: {
    header: 'Prognostic Summary',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.PrognosticSummary],
  },
  diagnosticLevel: {
    header: 'Dx Level',
    accessor: 'levelOfEvidence',
    evidenceTypes: [EvidenceEvidenceTypeEnum.DiagnosticImplication],
  },
  diagnosticDescription: {
    header: 'Dx Description',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.DiagnosticImplication],
  },
  prognosticLevel: {
    header: 'Px Level',
    accessor: 'levelOfEvidence',
    evidenceTypes: [EvidenceEvidenceTypeEnum.PrognosticImplication],
  },
  prognosticImplication: {
    header: 'Px Description',
    accessor: 'description',
    evidenceTypes: [EvidenceEvidenceTypeEnum.PrognosticImplication],
  },
};

const treatmentLevelEvidenceTypes = [
  EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugResistance,
  EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugSensitivity,
  EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugResistance,
  EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
];

type TreatmentLevelKeys =
  | 'hugoSymbol'
  | 'alteration'
  | 'tumorType'
  | 'evidenceId'
  | 'drugs'
  | 'treatmentLevel'
  | 'treatmentDescription'
  | 'liquidPropagationLevel'
  | 'solidPropagationLevel';
const TreatmentLevelEvidence: Record<TreatmentLevelKeys, EvidenceMapping> = {
  hugoSymbol: HUGOSYMBOL_EVIDENCE_MAPPING,
  alteration: ALTERATION_EVIDENCE_MAPPING,
  tumorType: TUMORTYPE_EVIDENCE_MAPPING,
  evidenceId: EVIDENCE_ID_EVIDENCE_MAPPING,
  drugs: DRUG_NAME_EVIDENCE_MAPPING,
  treatmentLevel: {
    header: 'Tx Level',
    accessor: 'levelOfEvidence',
    evidenceTypes: treatmentLevelEvidenceTypes,
  },
  treatmentDescription: {
    header: 'Treatment Description',
    accessor: 'description',
    evidenceTypes: treatmentLevelEvidenceTypes,
  },
  liquidPropagationLevel: {
    header: 'Liquid Propagation Level',
    accessor: 'liquidPropagationLevel',
    evidenceTypes: treatmentLevelEvidenceTypes,
  },
  solidPropagationLevel: {
    header: 'Solid Propagation Level',
    accessor: 'solidPropagationLevel',
    evidenceTypes: treatmentLevelEvidenceTypes,
  },
};

type CategoryConfig<T extends Record<string, EvidenceMapping>> = {
  levelEvidenceMap: T;
  fileName: string;
  groupingFields: (keyof T)[];
  outputGroupingFields?: (keyof T)[];
};

const CATEGORY_CONFIGS: {
  gene: CategoryConfig<typeof GeneLevelEvidence>;
  mutation: CategoryConfig<typeof MutationLevelEvidence>;
  genomicIndicator: CategoryConfig<typeof GenomicIndicatorLevelEvidence>;
  tumor: CategoryConfig<typeof TumorLevelEvidence>;
  treatment: CategoryConfig<typeof TreatmentLevelEvidence>;
} = {
  gene: {
    levelEvidenceMap: GeneLevelEvidence,
    fileName: 'gene-level-evidences.tsv',
    groupingFields: ['hugoSymbol'],
  },
  mutation: {
    levelEvidenceMap: MutationLevelEvidence,
    fileName: 'mutation-level-evidences.tsv',
    groupingFields: ['hugoSymbol', 'alteration'],
  },
  genomicIndicator: {
    levelEvidenceMap: GenomicIndicatorLevelEvidence,
    fileName: 'genomic-indicator-level-evidences.tsv',
    groupingFields: ['hugoSymbol', 'name'],
    outputGroupingFields: ['hugoSymbol', 'name'],
  },
  tumor: {
    levelEvidenceMap: TumorLevelEvidence,
    fileName: 'tumor-type-level-evidences.tsv',
    groupingFields: ['hugoSymbol', 'alteration', 'tumorType'],
  },
  treatment: {
    levelEvidenceMap: TreatmentLevelEvidence,
    fileName: 'treatment-level-evidences.tsv',
    groupingFields: ['hugoSymbol', 'alteration', 'tumorType', 'evidenceId'],
    outputGroupingFields: ['hugoSymbol', 'alteration', 'tumorType'],
  },
};

function getCancerTypeNameFromEvidence(evidence: Evidence): string {
  if (!evidence.cancerTypes || evidence.cancerTypes.length === 0) return '';

  const ct = evidence.cancerTypes.map(tt => convertOncoKbTumorTypeToCancerType(tt));
  const ect = evidence.excludedCancerTypes?.map(ett => convertOncoKbTumorTypeToCancerType(ett));

  if (ect) {
    return getCancerTypesNameWithExclusion(ct, ect);
  } else {
    return getCancerTypesName(ct);
  }
}

function getAssociatedVariantsFromEvidence(evidence: Evidence): string {
  return (evidence.alterations ?? [])
    .map(alteration => alteration.alteration)
    .filter((value): value is string => Boolean(value))
    .join(', ');
}

function getDrugsNameFromEvidence(evidence: Evidence): string {
  return evidence.treatments?.map(treatment => getTreatmentNameByPriority(treatment)).join(', ') ?? '';
}

function getDrugNameFromTreatment(drug: TreatmentDrug) {
  // Copied from oncokb-public and should be fixed when this issue (https://github.com/oncokb/oncokb/issues/3913) is closed.
  // @ts-expect-error Have to use ignore to escape the actual model structure. The swagger does not reflect the actually json structure
  return drug.drugName;
}

function getTreatmentNameByPriority(treatment: Treatment) {
  return _.sortBy(treatment.drugs, 'priority')
    .map(drug => getDrugNameFromTreatment(drug))
    .join(' + ');
}

function getNestedValueAsString(obj: any, path: string): string {
  return String(getValueByNestedKey(obj, path, '.') ?? '');
}

const getDownloadMetaData = <T extends Record<string, EvidenceMapping>>(selectedOptions: readonly OptionType[], levelEvidenceMap: T) => {
  const evidenceKeys = selectedOptions.flatMap(option => option.evidenceKeys) as Array<keyof T>;

  const evidenceMeta = evidenceKeys.map(key => levelEvidenceMap[key]);

  const uniqueEvidenceTypes = _.uniq(evidenceMeta.filter(meta => meta.evidenceTypes).flatMap(meta => meta.evidenceTypes || []));

  const selectedEvidences: Record<string, EvidenceMapping> = Object.fromEntries(
    evidenceKeys.filter(key => key in levelEvidenceMap).map(key => [key as string, levelEvidenceMap[key]]),
  );

  return { evidenceKeys, uniqueEvidenceTypes, selectedEvidences };
};

const getEvidenceMappingValue = (evidenceMapping: EvidenceMapping | undefined) => {
  let value = evidenceMapping?.value ?? '';
  if (value.includes('\n')) {
    // Some descriptions have newline character which messes up the tsv file
    value = value.replaceAll('\n', '\\n');
  }
  return value;
};

type OptionType = {
  label: string;
  value: string;
  evidenceKeys: string[];
  category: 'gene' | 'mutation' | 'genomicIndicator' | 'tumor' | 'treatment';
  isDisabled?: boolean;
};

type GeneticTypeOption = {
  label: string;
  value: 'somatic' | 'germline';
};

const GENETIC_TYPE_OPTIONS: GeneticTypeOption[] = [
  { label: 'Somatic', value: 'somatic' },
  { label: 'Germline', value: 'germline' },
];

const formatOptionLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
};

const buildOptions = (
  evidenceObject: Record<string, { isGroupingField?: boolean }>,
  category: OptionType['category'],
  extraOptions: OptionType[] = [],
): OptionType[] => {
  const options: OptionType[] = [];

  for (const [key, value] of Object.entries(evidenceObject)) {
    if (value.isGroupingField) continue;
    options.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category,
    });
  }

  return [...options, ...extraOptions];
};

const buildOptionsFromKeys = <T extends Record<string, EvidenceMapping>>(
  evidenceObject: T,
  category: OptionType['category'],
  keys: Array<keyof T>,
): OptionType[] =>
  keys
    .filter(key => key in evidenceObject)
    .map(key => ({
      label: formatOptionLabel(String(key)),
      value: String(key),
      evidenceKeys: [String(key)],
      category,
    }));

const groupedDropdownOptions = (isGermline: boolean): GroupBase<OptionType>[] => {
  const geneLevelOptions: OptionType[] = [];
  for (const [key, value] of Object.entries(GeneLevelEvidence)) {
    if (value.isGroupingField) {
      continue;
    }
    geneLevelOptions.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category: 'gene',
    });
  }

  const mutationLevelOptionKeys = isGermline ? MUTATION_LEVEL_GERMLINE_KEYS : MUTATION_LEVEL_SOMATIC_KEYS;
  const mutationLevelOptions = buildOptionsFromKeys(MutationLevelEvidence, 'mutation', mutationLevelOptionKeys);
  const genomicIndicatorOptions = buildOptionsFromKeys(GenomicIndicatorLevelEvidence, 'genomicIndicator', GENOMIC_INDICATOR_LEVEL_KEYS);
  const tumorLevelOptions = buildOptions(TumorLevelEvidence, 'tumor');
  const treatmentLevelOptions = buildOptions(TreatmentLevelEvidence, 'treatment');

  const groupedOptions: GroupBase<OptionType>[] = [
    { label: 'Gene Level', options: geneLevelOptions },
    { label: 'Mutation Level', options: mutationLevelOptions },
  ];

  if (isGermline) {
    groupedOptions.push({ label: 'Genomic Indicator Level', options: genomicIndicatorOptions });
  }

  const tumorOptions = isGermline ? tumorLevelOptions.map(option => ({ ...option, isDisabled: true })) : tumorLevelOptions;
  const treatmentOptions = isGermline ? treatmentLevelOptions.map(option => ({ ...option, isDisabled: true })) : treatmentLevelOptions;

  groupedOptions.push({ label: isGermline ? 'Tumor Level (Coming soon)' : 'Tumor Level', options: tumorOptions });
  groupedOptions.push({ label: isGermline ? 'Treatment Level (Coming soon)' : 'Treatment Level', options: treatmentOptions });

  return groupedOptions;
};

const EvidenceDownloader = () => {
  const [isFetchingEvidences, setIsFetchingEvidences] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<readonly OptionType[]>([]);
  const [activeCategory, setActiveCategory] = useState<'gene' | 'mutation' | 'genomicIndicator' | 'tumor' | 'treatment' | null>(null);
  const [selectedGeneticType, setSelectedGeneticType] = useState<GeneticTypeOption>(GENETIC_TYPE_OPTIONS[0]);

  const fetchEvidenceData = async (evidenceTypes: EvidenceEvidenceTypeEnum[], germline: boolean): Promise<Evidence[] | undefined> => {
    try {
      setIsFetchingEvidences(true);
      const response = await evidenceClient.evidencesLookupGetUsingGET(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        _.uniq(evidenceTypes).join(','),
        undefined,
        germline,
      );
      return response.data;
    } catch (error) {
      notifyError('Could not fetch evidences');
    } finally {
      setIsFetchingEvidences(false);
    }
  };

  const handleGeneticTypeChange = (option: GeneticTypeOption | null) => {
    if (option) {
      const isGermline = option.value === 'germline';
      setSelectedGeneticType(option);
      if (
        activeCategory === 'mutation' ||
        (isGermline && (activeCategory === 'tumor' || activeCategory === 'treatment')) ||
        (!isGermline && activeCategory === 'genomicIndicator')
      ) {
        setSelectedOptions([]);
        setActiveCategory(null);
      }
    }
  };

  const handleChange = (newOptions: readonly OptionType[]) => {
    if (newOptions.length === 0) {
      setSelectedOptions([]);
      setActiveCategory(null);
      return;
    }

    const lastOption = newOptions[newOptions.length - 1];

    if (!activeCategory || lastOption.category === activeCategory) {
      setActiveCategory(lastOption.category);
      setSelectedOptions(newOptions.filter(option => option.category === lastOption.category));
    } else {
      setActiveCategory(lastOption.category);
      setSelectedOptions([lastOption]);
    }
  };

  const handleEvidenceDownload = async <K extends keyof typeof CATEGORY_CONFIGS>(category: K) => {
    const categoryConfig = CATEGORY_CONFIGS[category];
    const levelEvidenceMap = categoryConfig.levelEvidenceMap;

    const { uniqueEvidenceTypes, selectedEvidences, evidenceKeys } = getDownloadMetaData(selectedOptions, levelEvidenceMap);

    const evidences = await fetchEvidenceData(uniqueEvidenceTypes, selectedGeneticType.value === 'germline');
    if (!evidences) return;

    const grouped = evidences.reduce((acc, evidence) => {
      const groupValues: string[] = [];
      let skipEvidence = false;

      for (const field of categoryConfig.groupingFields) {
        const fieldMapping = levelEvidenceMap[field];

        let value = '';
        if (typeof fieldMapping.accessor === 'string') {
          value = getNestedValueAsString(evidence, fieldMapping.accessor);
        } else if (typeof fieldMapping.accessor === 'function') {
          value = fieldMapping.accessor(evidence);
        }

        if (!value) {
          skipEvidence = true;
          break;
        }

        groupValues.push(value);
      }

      if (skipEvidence) return acc;

      const populatedEvidences = _.cloneDeep(selectedEvidences);

      for (const [evidenceKey, selectedEvidence] of Object.entries(populatedEvidences)) {
        if (!evidence.evidenceType || !selectedEvidence.evidenceTypes?.includes(evidence.evidenceType)) {
          continue;
        }

        if (typeof selectedEvidence.accessor === 'string') {
          selectedEvidence.value = getNestedValueAsString(evidence, selectedEvidence.accessor);
        } else if (typeof selectedEvidence.accessor === 'function') {
          const rawValue = selectedEvidence.accessor(evidence);
          selectedEvidence.value = Array.isArray(rawValue)
            ? rawValue
                .map(item => String(item))
                .filter(Boolean)
                .join(', ')
            : String(rawValue ?? '');
        }

        // Build nested objects for each grouping level
        let current = acc;
        for (let i = 0; i < groupValues.length; i++) {
          const key = groupValues[i];
          if (i === groupValues.length - 1) {
            current[key] = current[key] ?? {};
            current[key][evidenceKey] = selectedEvidence;
          } else {
            current[key] = current[key] ?? {};
            current = current[key];
          }
        }
      }

      return acc;
    }, {});

    const outputGroupingFields = categoryConfig.outputGroupingFields ?? categoryConfig.groupingFields;
    const headers = [
      ...outputGroupingFields.map(field => levelEvidenceMap[field].header),
      ...evidenceKeys.map(key => levelEvidenceMap[key].header),
    ];

    const tsvRows = [headers.join('\t')];

    const buildRows = (obj: any, depth: number, groupingFieldData: string[]) => {
      if (depth === categoryConfig.groupingFields.length) {
        // We've reached the leaf level (finished retrieving grouping field data)
        const groupingFieldValueMap = Object.fromEntries(
          categoryConfig.groupingFields.map((field, index) => [field, groupingFieldData[index]]),
        );
        const outputGroupingFieldData = outputGroupingFields.map(field => groupingFieldValueMap[field] ?? '');
        const row = [...outputGroupingFieldData, ...evidenceKeys.map(key => getEvidenceMappingValue(obj[key]))];
        tsvRows.push(row.join('\t'));
        return;
      }

      for (const key of Object.keys(obj).sort()) {
        buildRows(obj[key], depth + 1, [...groupingFieldData, key]);
      }
    };

    buildRows(grouped, 0, []);

    const tsvContent = tsvRows.join('\n');
    const fileNameSuffix = selectedGeneticType.value;
    const outputFileName = categoryConfig.fileName.endsWith('.tsv')
      ? categoryConfig.fileName.replace(/\.tsv$/i, `-${fileNameSuffix}.tsv`)
      : `${categoryConfig.fileName}-${fileNameSuffix}`;
    downloadFile(outputFileName, tsvContent);
  };

  const handleDownload = () => {
    const category = selectedOptions[0]?.category;
    if (category) {
      handleEvidenceDownload(category);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <Select options={GENETIC_TYPE_OPTIONS} value={selectedGeneticType} onChange={handleGeneticTypeChange} isSearchable={false} />
      </div>
      <Select
        isMulti
        options={groupedDropdownOptions(selectedGeneticType.value === 'germline')}
        placeholder="Select data type"
        onChange={handleChange}
        value={selectedOptions}
        isOptionDisabled={option => !!option.isDisabled || (activeCategory !== null && option.category !== activeCategory)}
        closeMenuOnSelect={false}
      />
      <div className="d-flex justify-content-end mt-2">
        <AsyncSaveButton
          color="primary"
          outline
          onClick={handleDownload}
          disabled={isFetchingEvidences || selectedOptions.length === 0}
          confirmText={isFetchingEvidences ? 'Downloading' : 'Download'}
        />
      </div>
    </div>
  );
};

export default EvidenceDownloader;
