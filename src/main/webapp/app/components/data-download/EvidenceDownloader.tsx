import { evidenceClient } from 'app/shared/api/clients';
import React, { useState } from 'react';
import Select, { GroupBase } from 'react-select';
import { Evidence, EvidenceEvidenceTypeEnum, Treatment, TreatmentDrug } from 'app/shared/api/generated/core';
import { downloadFile } from 'app/shared/util/file-utils';
import _ from 'lodash';
import { convertOncoKbTumorTypeToCancerType, getCancerTypesName, getCancerTypesNameWithExclusion } from 'app/shared/util/utils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

const getNestedValueAsString = (obj: any, path: string, sep = '.'): string => {
  return (
    String(
      path.split(sep).reduce((acc, key) => {
        if (acc && typeof acc === 'object') {
          return acc[key];
        }
        return undefined;
      }, obj),
    ) ?? ''
  );
};

type EvidenceMapping = {
  header: string;
  accessor: string;
  evidenceTypes: EvidenceEvidenceTypeEnum[];
  value?: string;
};

const GeneLevelEvidence: Record<string, EvidenceMapping> = {
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
  oncogene: {
    header: 'Oncogene',
    accessor: 'gene.oncogene',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GeneSummary], // There is no specific evidence type for ocg or tsg, so we use GENE_SUMMARY
  },
  tumorSuppressor: {
    header: 'Tumor Suppressor',
    accessor: 'gene.tsg',
    evidenceTypes: [EvidenceEvidenceTypeEnum.GeneSummary], // There is no specific evidence type for ocg or tsg, so we use GENE_SUMMARY
  },
};

const MutationLevelEvidence: Record<string, EvidenceMapping> = {
  oncogenicity: {
    header: 'Oncogenicity',
    accessor: 'knownEffect',
    evidenceTypes: [EvidenceEvidenceTypeEnum.Oncogenic],
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

const TumorLevelEvidence: Record<string, EvidenceMapping> = {
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

const TreatmentLevelEvidence: Record<string, EvidenceMapping> = {
  drugs: {
    header: 'Drug(s)',
    accessor: '',
    evidenceTypes: treatmentLevelEvidenceTypes,
  },
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

const getDownloadMetaData = (selectedOptions: readonly OptionType[], someLevelEvidence: Record<string, EvidenceMapping>) => {
  const evidenceKeys = selectedOptions.flatMap(option => option.evidenceKeys);
  const evidenceMeta = evidenceKeys.map(key => someLevelEvidence[key]);
  const uniqueEvidenceTypes = _.uniq(evidenceMeta.flatMap(meta => meta.evidenceTypes));

  const selectedEvidences: Record<string, EvidenceMapping> = Object.fromEntries(
    evidenceKeys.filter(key => key in someLevelEvidence).map(key => [key, someLevelEvidence[key]]),
  );

  return { evidenceKeys, uniqueEvidenceTypes, selectedEvidences };
};

const getEvidenceMappingValue = (evidenceMapping: EvidenceMapping | undefined) => {
  let value = evidenceMapping?.value ?? '';
  if (value.includes('\n')) {
    value = `"${value}"`;
  }
  return value;
};

type OptionType = {
  label: string;
  value: string;
  evidenceKeys: string[];
  category: 'gene' | 'mutation' | 'tumor' | 'treatment';
};

const formatOptionLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
};

const groupedDropdownOptions = (): GroupBase<OptionType>[] => {
  const geneLevelOptions: OptionType[] = [];
  const mutationLevelOptions: OptionType[] = [];
  const tumorLevelOptions: OptionType[] = [];
  const treatmentLevelOptions: OptionType[] = [];

  for (const key of Object.keys(GeneLevelEvidence)) {
    if (key === 'oncogene' || key === 'tumorSuppressor') {
      continue;
    }
    geneLevelOptions.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category: 'gene',
    });
  }
  geneLevelOptions.push({
    label: 'Gene Type',
    value: 'geneType',
    evidenceKeys: ['oncogene', 'tumorSuppressor'],
    category: 'gene',
  });

  for (const key of Object.keys(MutationLevelEvidence)) {
    mutationLevelOptions.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category: 'mutation',
    });
  }

  for (const key of Object.keys(TumorLevelEvidence)) {
    tumorLevelOptions.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category: 'tumor',
    });
  }

  for (const key of Object.keys(TreatmentLevelEvidence)) {
    treatmentLevelOptions.push({
      label: formatOptionLabel(key),
      value: key,
      evidenceKeys: [key],
      category: 'treatment',
    });
  }

  return [
    {
      label: 'Gene Level',
      options: geneLevelOptions,
    },
    {
      label: 'Mutation Level',
      options: mutationLevelOptions,
    },
    {
      label: 'Tumor Level',
      options: tumorLevelOptions,
    },
    {
      label: 'Treatment Level',
      options: treatmentLevelOptions,
    },
  ];
};

const EvidenceDownloader = () => {
  const [isFetchingEvidences, setIsFetchingEvidences] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<readonly OptionType[]>([]);
  const [activeCategory, setActiveCategory] = useState<'gene' | 'mutation' | 'tumor' | 'treatment' | null>(null);

  const fetchEvidenceData = async (evidenceTypes: EvidenceEvidenceTypeEnum[]): Promise<Evidence[] | undefined> => {
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
      );
      return response.data;
    } catch (error) {
      notifyError('Could not fetch evidences');
    } finally {
      setIsFetchingEvidences(false);
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

  const handleGeneLevelDownload = async () => {
    const { uniqueEvidenceTypes, selectedEvidences, evidenceKeys } = getDownloadMetaData(selectedOptions, GeneLevelEvidence);

    const evidences = await fetchEvidenceData(uniqueEvidenceTypes);
    if (!evidences) return;

    const groupedByGene: Record<string, Record<string, EvidenceMapping>> = {};

    for (const evidence of evidences) {
      const hugo = getNestedValueAsString(evidence, 'gene.hugoSymbol');
      if (!hugo) continue;

      const populatedEvidences = _.cloneDeep(selectedEvidences);
      for (const [evidenceKey, selectedEvidence] of Object.entries(populatedEvidences)) {
        if (!evidence.evidenceType || !selectedEvidence.evidenceTypes.includes(evidence.evidenceType)) continue;
        selectedEvidence.value = getNestedValueAsString(evidence, selectedEvidence.accessor);
        if (!groupedByGene[hugo]) {
          groupedByGene[hugo] = {};
        }
        groupedByGene[hugo][evidenceKey] = selectedEvidence;
      }
    }

    const headers = ['Gene', ...evidenceKeys.map(key => GeneLevelEvidence[key].header)];
    const tsvRows = [headers.join('\t')];

    for (const [gene, data] of Object.entries(groupedByGene).sort()) {
      const row = [gene, ...evidenceKeys.map(key => getEvidenceMappingValue(data[key]))];
      tsvRows.push(row.join('\t'));
    }

    const tsvContent = tsvRows.join('\n');
    downloadFile('gene-level-evidences.tsv', tsvContent);
  };

  const handleMutationLevelDownload = async () => {
    const { uniqueEvidenceTypes, selectedEvidences, evidenceKeys } = getDownloadMetaData(selectedOptions, MutationLevelEvidence);

    const evidences = await fetchEvidenceData(uniqueEvidenceTypes);
    if (!evidences) return;

    const groupedByGeneAndAlteration: Record<string, Record<string, Record<string, EvidenceMapping>>> = {};

    for (const evidence of evidences) {
      const hugo = getNestedValueAsString(evidence, 'gene.hugoSymbol');
      const alteration = getNestedValueAsString(evidence, 'alterations.0.alteration');
      if (!hugo || !alteration) continue;

      const populatedEvidences = _.cloneDeep(selectedEvidences);
      for (const [evidenceKey, selectedEvidence] of Object.entries(populatedEvidences)) {
        if (!evidence.evidenceType || !selectedEvidence.evidenceTypes.includes(evidence.evidenceType)) continue;
        selectedEvidence.value = getNestedValueAsString(evidence, selectedEvidence.accessor);

        groupedByGeneAndAlteration[hugo] ??= {};
        groupedByGeneAndAlteration[hugo][alteration] ??= {};
        groupedByGeneAndAlteration[hugo][alteration][evidenceKey] = selectedEvidence;
      }
    }

    const headers = ['Gene', 'Alteration', ...evidenceKeys.map(key => MutationLevelEvidence[key].header)];
    const tsvRows = [headers.join('\t')];

    for (const [gene, alterationMap] of Object.entries(groupedByGeneAndAlteration).sort()) {
      for (const [alteration, data] of Object.entries(alterationMap).sort()) {
        const row = [gene, alteration, ...evidenceKeys.map(key => getEvidenceMappingValue(data[key]))];
        tsvRows.push(row.join('\t'));
      }
    }

    const tsvContent = tsvRows.join('\n');
    downloadFile('mutation-level-evidences.tsv', tsvContent);
  };

  const handleTumorLevelDownload = async () => {
    const { uniqueEvidenceTypes, selectedEvidences, evidenceKeys } = getDownloadMetaData(selectedOptions, TumorLevelEvidence);

    const evidences = await fetchEvidenceData(uniqueEvidenceTypes);
    if (!evidences) return;

    // 3 level grouping: hugo | alteration | cancerType | evidence mapping
    const grouped: Record<string, Record<string, Record<string, Record<string, EvidenceMapping>>>> = {};
    for (const evidence of evidences) {
      const hugo = getNestedValueAsString(evidence, 'gene.hugoSymbol');
      const alterations = evidence.alterations ?? [];
      const cancerTypes = evidence.cancerTypes ?? [];

      if (!hugo || alterations.length === 0 || cancerTypes.length === 0) continue;

      for (const alt of alterations) {
        const alteration = alt.alteration;
        if (!alteration) continue;
        if (!evidence.cancerTypes) continue;

        const ct = evidence.cancerTypes.map(tt => convertOncoKbTumorTypeToCancerType(tt));
        const ect = evidence.excludedCancerTypes?.map(ett => convertOncoKbTumorTypeToCancerType(ett));
        let tumorName: string;
        if (ect) {
          tumorName = getCancerTypesNameWithExclusion(ct, ect);
        } else {
          tumorName = getCancerTypesName(ct);
        }
        if (!tumorName) continue;

        const populatedEvidences = _.cloneDeep(selectedEvidences);

        for (const [evidenceKey, selectedEvidence] of Object.entries(populatedEvidences)) {
          if (!evidence.evidenceType || !selectedEvidence.evidenceTypes.includes(evidence.evidenceType)) continue;
          selectedEvidence.value = getNestedValueAsString(evidence, selectedEvidence.accessor);

          grouped[hugo] ??= {};
          grouped[hugo][alteration] ??= {};
          grouped[hugo][alteration][tumorName] ??= {};
          grouped[hugo][alteration][tumorName][evidenceKey] = selectedEvidence;
        }
      }
    }

    const headers = ['Gene', 'Alteration', 'Cancer Type', ...evidenceKeys.map(key => TumorLevelEvidence[key].header)];
    const tsvRows = [headers.join('\t')];

    for (const [gene, alterationMap] of Object.entries(grouped).sort()) {
      for (const [alteration, tumorMap] of Object.entries(alterationMap).sort()) {
        for (const [tumor, data] of Object.entries(tumorMap).sort()) {
          const row = [gene, alteration, tumor, ...evidenceKeys.map(key => getEvidenceMappingValue(data[key]))];
          tsvRows.push(row.join('\t'));
        }
      }
    }

    const tsvContent = tsvRows.join('\n');
    downloadFile('tumor-type-level-evidences.tsv', tsvContent);
  };

  const handleTreatmentLevelDownload = async () => {
    const { uniqueEvidenceTypes, selectedEvidences, evidenceKeys } = getDownloadMetaData(selectedOptions, TreatmentLevelEvidence);

    const evidences = await fetchEvidenceData(uniqueEvidenceTypes);
    if (!evidences) return;

    const grouped: Record<string, Record<string, Record<string, Record<string, EvidenceMapping>>>> = {};

    for (const evidence of evidences) {
      const hugo = getNestedValueAsString(evidence, 'gene.hugoSymbol');
      const alterations = evidence.alterations ?? [];
      const cancerTypes = evidence.cancerTypes ?? [];

      if (!hugo || alterations.length === 0 || cancerTypes.length === 0) continue;

      for (const alt of alterations) {
        const alteration = alt.alteration;
        if (!alteration) continue;
        if (!evidence.cancerTypes) continue;

        const ct = evidence.cancerTypes.map(tt => convertOncoKbTumorTypeToCancerType(tt));
        const ect = evidence.excludedCancerTypes?.map(ett => convertOncoKbTumorTypeToCancerType(ett));
        let tumorName: string;
        if (ect) {
          tumorName = getCancerTypesNameWithExclusion(ct, ect);
        } else {
          tumorName = getCancerTypesName(ct);
        }
        if (!tumorName) continue;

        const populatedEvidences = _.cloneDeep(selectedEvidences);

        for (const [evidenceKey, selectedEvidence] of Object.entries(populatedEvidences)) {
          if (!evidence.evidenceType || !selectedEvidence.evidenceTypes.includes(evidence.evidenceType)) continue;

          if (evidenceKey === 'drugs') {
            selectedEvidence.value = evidence.treatments?.map(treatment => getTreatmentNameByPriority(treatment)).join(', ');
          } else {
            selectedEvidence.value = getNestedValueAsString(evidence, selectedEvidence.accessor);
          }

          grouped[hugo] ??= {};
          grouped[hugo][alteration] ??= {};
          grouped[hugo][alteration][tumorName] ??= {};
          grouped[hugo][alteration][tumorName][evidenceKey] = selectedEvidence;
        }
      }
    }

    const headers = ['Gene', 'Alteration', 'Cancer Type', ...evidenceKeys.map(key => TreatmentLevelEvidence[key].header)];
    const tsvRows = [headers.join('\t')];

    for (const [gene, alterationMap] of Object.entries(grouped).sort()) {
      for (const [alteration, tumorMap] of Object.entries(alterationMap).sort()) {
        for (const [tumor, data] of Object.entries(tumorMap).sort()) {
          const row = [gene, alteration, tumor, ...evidenceKeys.map(key => getEvidenceMappingValue(data[key]))];
          tsvRows.push(row.join('\t'));
        }
      }
    }

    const tsvContent = tsvRows.join('\n');
    downloadFile('treatment-level-evidences.tsv', tsvContent);
  };

  const handleDownload = () => {
    const category = selectedOptions.map(option => option.category)[0];
    switch (category) {
      case 'gene':
        handleGeneLevelDownload();
        break;
      case 'mutation':
        handleMutationLevelDownload();
        break;
      case 'tumor':
        handleTumorLevelDownload();
        break;
      case 'treatment':
        handleTreatmentLevelDownload();
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Select
        isMulti
        options={groupedDropdownOptions()}
        onChange={handleChange}
        value={selectedOptions}
        isOptionDisabled={option => activeCategory !== null && option.category !== activeCategory}
        closeMenuOnSelect={false}
      />
      <div className="d-flex justify-content-end mt-2">
        <AsyncSaveButton
          color="primary"
          outline
          onClick={handleDownload}
          disabled={isFetchingEvidences}
          confirmText={isFetchingEvidences ? 'Downloading' : 'Download'}
        />
      </div>
    </div>
  );
};

export default EvidenceDownloader;
