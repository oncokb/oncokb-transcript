import { DX_LEVELS, FDA_LEVELS, FIREBASE_ONCOGENICITY, PX_LEVELS, TI_TYPE, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getEvidence, pathToGetEvidenceArgs } from './core-evidence-submission';
import { Evidence, EvidenceEvidenceTypeEnum, EvidenceLevelOfEvidenceEnum } from 'app/shared/api/generated/core';
import { generateUuid } from '../utils';
import {
  createMockDrug,
  createMockGene,
  createMockImplication,
  createMockMutation,
  createMockMutationEffect,
  createMockReview,
  createMockTi,
  createMockTreatment,
  createMockTumor,
} from '../core-submission-shared/core-submission.mocks';

type GetEvidenceArgs = Parameters<typeof getEvidence>[0];
type GetEvidenceRtn = ReturnType<typeof getEvidence>;
describe('getEvidence to submit to core', () => {
  describe('Path parse tests', () => {
    const treatment = createMockTreatment({
      level: TX_LEVELS.LEVEL_1,
      fdaLevel: FDA_LEVELS.LEVEL_FDA1,
      propagation: TX_LEVELS.LEVEL_2,
      propagationLiquid: TX_LEVELS.LEVEL_4,
      description_review: createMockReview({}),
      propagation_review: createMockReview({}),
      excludedRCTs_review: createMockReview({}),
      level_review: createMockReview({}),
      name_review: createMockReview({}),
      fdaLevel_review: createMockReview({}),
    });
    const tiIs = createMockTi({ type: TI_TYPE.IS, treatments: [treatment] });
    const tiIr = createMockTi({ type: TI_TYPE.IR, treatments: [treatment] });
    const tiSs = createMockTi({ type: TI_TYPE.SS, treatments: [treatment] });
    const tiSr = createMockTi({ type: TI_TYPE.SR, treatments: [treatment] });

    const tumor = createMockTumor({
      TIs: [tiIs, tiIr, tiSs, tiSr],
      cancerTypes: [{ code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() }],
      excludedCancerTypes: [{ code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() }],
      prognostic: createMockImplication({
        level: DX_LEVELS.LEVEL_DX1,
        excludedRCTs: [{ code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() }],
      }),
      prognosticSummary_review: createMockReview({}),

      diagnostic: createMockImplication({
        level: PX_LEVELS.LEVEL_PX1,
        excludedRCTs: [{ code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() }],
      }),
      diagnosticSummary_review: createMockReview({}),
      summary: generateUuid(),
      summary_review: createMockReview({}),
      cancerTypes_review: createMockReview({}),
    });
    const mutation = createMockMutation({
      tumors: [tumor],
      name_review: createMockReview({}),
      mutation_effect: createMockMutationEffect({
        effect_review: createMockReview({}),
        oncogenic_review: createMockReview({}),
        description_review: createMockReview({}),
        pathogenic_review: createMockReview({}),
      }),
    });
    const gene = createMockGene({
      mutations: [mutation],
      summary_review: createMockReview({}),
      background_review: createMockReview({}),
    });

    const baseExpectedArgs: Pick<GetEvidenceArgs, 'drugListRef' | 'entrezGeneId' | 'updateTime' | 'gene'> = {
      drugListRef: {},
      entrezGeneId: Math.random(),
      updateTime: new Date().getTime(),
      gene,
    };

    type ArrayElement = [Parameters<typeof pathToGetEvidenceArgs>[0] & { valuePath: string }, args: Partial<GetEvidenceArgs>];

    const goodTests: ArrayElement[] = [
      [{ ...baseExpectedArgs, valuePath: 'mutations/0' }, undefined],
      // gene type change
      [{ ...baseExpectedArgs, valuePath: 'type' }, undefined],
      // mutation name change
      [{ ...baseExpectedArgs, valuePath: 'mutations/0/name_review' }, undefined],
      // tumor name change
      [{ ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/cancerTypes_review' }, undefined],
      [
        { ...baseExpectedArgs, valuePath: 'summary' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.GeneSummary },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'background' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.GeneBackground },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/mutation_effect/oncogenic' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.Oncogenic, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/summary' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.TumorTypeSummary, tumor, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/prognosticSummary' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.PrognosticSummary,
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/diagnosticSummary' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.DiagnosticSummary,
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/mutation_effect/effect' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.MutationEffect, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/mutation_effect/description' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.MutationEffect, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/prognostic/level' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.PrognosticImplication,
          tumor,
          mutation,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/diagnostic/level' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.DiagnosticImplication,
          tumor,
          mutation,
        },
      ],
      ...[
        {
          level: TX_LEVELS.LEVEL_1,
          type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
        },
        {
          level: TX_LEVELS.LEVEL_2,
          type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
        },
        {
          level: TX_LEVELS.LEVEL_3A,
          type: EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugSensitivity,
        },
        {
          level: TX_LEVELS.LEVEL_3B,
          type: EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugSensitivity,
        },
        {
          level: TX_LEVELS.LEVEL_4,
          type: EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugSensitivity,
        },
        {
          level: TX_LEVELS.LEVEL_R1,
          type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugResistance,
        },
        {
          level: TX_LEVELS.LEVEL_R2,
          type: EvidenceEvidenceTypeEnum.InvestigationalTherapeuticImplicationsDrugResistance,
        },
      ].map(({ level, type }): ArrayElement => {
        const newGene = createMockGene({
          ...gene,
          mutations: [
            createMockMutation({
              ...mutation,
              tumors: [
                createMockTumor({ ...tumor, TIs: [createMockTi({ ...tiIs, treatments: [createMockTreatment({ ...treatment, level })] })] }),
              ],
            }),
          ],
        });
        return [
          {
            ...baseExpectedArgs,
            gene: newGene,
            valuePath: 'mutations/0/tumors/0/TIs/0/treatments/0',
          },
          {
            ...baseExpectedArgs,
            type,
            tumor: newGene.mutations[0].tumors[0],
            mutation: newGene.mutations[0],
            gene: newGene,
            ti: newGene.mutations[0].tumors[0].TIs[0],
            treatment: newGene.mutations[0].tumors[0].TIs[0].treatments[0],
          },
        ];
      }),
      ...Object.keys(
        createMockTreatment({
          name: undefined,
          level: undefined,
          short: undefined,
          fdaLevel: undefined,
          name_uuid: undefined,
          indication: undefined,
          level_uuid: undefined,
          description: undefined,
          name_review: undefined,
          propagation: undefined,
          excludedRCTs: undefined,
          level_review: undefined,
          fdaLevel_uuid: undefined,
          name_comments: undefined,
          fdaLevel_review: undefined,
          indication_uuid: undefined,
          description_uuid: undefined,
          propagation_uuid: undefined,
          excludedRCTs_uuid: undefined,
          propagationLiquid: undefined,
          description_review: undefined,
          propagation_review: undefined,
          excludedRCTs_review: undefined,
          propagationLiquid_uuid: undefined,
        }),
      ).map((key: keyof ReturnType<typeof createMockTreatment>): ArrayElement => {
        const valuePath = `mutations/0/tumors/0/TIs/1/treatments/0/${key}`;
        if (key === 'short' || key === 'indication' || key === 'name_review') {
          return [{ ...baseExpectedArgs, valuePath }, undefined];
        }
        return [
          {
            ...baseExpectedArgs,
            valuePath,
          },
          {
            ...baseExpectedArgs,
            type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
            tumor,
            mutation,
            ti: tiIr,
            treatment,
          },
        ];
      }),
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/TIs/2/treatments/0' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
          tumor,
          mutation,
          ti: tiSs,
          treatment,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/0/tumors/0/TIs/3/treatments/0' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
          tumor,
          mutation,
          gene,
          ti: tiSr,
          treatment,
        },
      ],
    ];
    test.each(goodTests)('Path should parse as expected for path %s', (args, expected) => {
      expect(pathToGetEvidenceArgs(args)).toEqual(expected);
    });
    const badTests: [valuePath: string][] = [
      ['bad/path'],
      ['mutations/0/bad'],
      ['mutations/300'],
      ['mutations/bad/0/mutation_effect/'],
      ['/'],
      [''],
    ];
    test.each(badTests)('Should throw exception for path "%s"', (valuePath: string) => {
      expect(() => pathToGetEvidenceArgs({ ...baseExpectedArgs, valuePath })).toThrow(Error);
    });
  });
  describe('evidences mapping tests', () => {
    type PathArgs = Parameters<typeof pathToGetEvidenceArgs>[0];
    const baseArgs: Omit<PathArgs, 'valuePath' | 'gene'> = {
      drugListRef: {},
      entrezGeneId: Math.random(),
      updateTime: new Date().getTime(),
    };
    const baseEvidence: Evidence = {
      additionalInfo: null,
      alterations: [],
      articles: null,
      description: null,
      fdaLevel: null,
      knownEffect: null,
      levelOfEvidence: null,
      liquidPropagationLevel: null,
      solidPropagationLevel: null,
      treatments: [],
      cancerTypes: [],
      excludedCancerTypes: [],
      relevantCancerTypes: [],
    };

    const getTimeFromDateString = (s: string) => new Date(s).getTime();
    const hugoSymbol = 'ABL1';

    const goodTests: [PathArgs, args: GetEvidenceRtn][] = [
      [
        {
          ...baseArgs,
          valuePath: 'summary',
          gene: createMockGene({
            name: hugoSymbol,
            summary: 'Gene Summary',
            summary_uuid: 'd7ea4dc5-383d-40b8-a51f-725d25c087d2',
            summary_review: createMockReview({
              updateTime: getTimeFromDateString('2000-01-01'),
            }),
          }),
        },
        {
          ['d7ea4dc5-383d-40b8-a51f-725d25c087d2']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.GeneSummary,
            description: 'Gene Summary',
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2000-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'background',
          gene: createMockGene({
            name: hugoSymbol,
            background: 'Gene Background',
            background_uuid: 'e9c7cc54-87a7-4903-9d0b-84a61977e669',
            background_review: createMockReview({
              updateTime: getTimeFromDateString('2001-01-01'),
            }),
          }),
        },
        {
          ['e9c7cc54-87a7-4903-9d0b-84a61977e669']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.GeneBackground,
            description: 'Gene Background',
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2001-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/prognosticSummary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    prognosticSummary_uuid: 'd9c991e4-1c13-4251-bd5a-fac0344b3470',
                    prognosticSummary: 'Prognostic Summary',
                    prognosticSummary_review: createMockReview({
                      updateTime: getTimeFromDateString('2002-01-01'),
                    }),
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['d9c991e4-1c13-4251-bd5a-fac0344b3470']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.PrognosticSummary,
            description: 'Prognostic Summary',
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2002-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/diagnosticSummary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    diagnosticSummary_uuid: 'a8ba8d36-ee0b-4e9c-ad3b-49137c271a82',
                    diagnosticSummary: 'Diagnostic Summary',
                    diagnosticSummary_review: createMockReview({
                      updateTime: getTimeFromDateString('2000-01-01'),
                    }),
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['a8ba8d36-ee0b-4e9c-ad3b-49137c271a82']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.DiagnosticSummary,
            description: 'Diagnostic Summary',
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2000-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/mutation_effect/effect',
          updateTime: getTimeFromDateString('2000-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                mutation_effect: createMockMutationEffect({
                  description: 'Mutation Effect',
                  effect_uuid: 'a7046e8d-af62-4284-a14d-fc145134529a',
                  oncogenic: FIREBASE_ONCOGENICITY.LIKELY,
                  effect: FIREBASE_ONCOGENICITY.RESISTANCE,
                  effect_review: createMockReview({
                    updateTime: getTimeFromDateString('2002-01-01'),
                  }),
                  oncogenic_uuid: '8b076b49-5baa-4a74-90f1-c115a65b19e5',
                  oncogenic_review: createMockReview({
                    updateTime: getTimeFromDateString('2001-01-01'),
                  }),
                }),
              }),
            ],
          }),
        },
        {
          ['a7046e8d-af62-4284-a14d-fc145134529a']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.MutationEffect,
            description: 'Mutation Effect',
            knownEffect: FIREBASE_ONCOGENICITY.RESISTANCE,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2002-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/mutation_effect/oncogenic',
          updateTime: getTimeFromDateString('2000-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                mutation_effect: createMockMutationEffect({
                  description: 'Mutation Effect',
                  effect_uuid: 'a7046e8d-af62-4284-a14d-fc145134529a',
                  oncogenic: FIREBASE_ONCOGENICITY.LIKELY,
                  effect: FIREBASE_ONCOGENICITY.RESISTANCE,
                  effect_review: createMockReview({
                    updateTime: getTimeFromDateString('2002-01-01'),
                  }),
                  oncogenic_uuid: '8b076b49-5baa-4a74-90f1-c115a65b19e5',
                  oncogenic_review: createMockReview({
                    updateTime: getTimeFromDateString('2001-01-01'),
                  }),
                }),
              }),
            ],
          }),
        },
        {
          ['8b076b49-5baa-4a74-90f1-c115a65b19e5']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.Oncogenic,
            knownEffect: FIREBASE_ONCOGENICITY.LIKELY,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            lastEdit: getTimeFromDateString('2001-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/prognostic/level',
          updateTime: getTimeFromDateString('2003-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    prognostic_uuid: '8947bdb9-b77d-4fe4-a8a1-71dc7c41b1e4',
                    prognostic: createMockImplication({
                      level: PX_LEVELS.LEVEL_PX1,
                      description: 'Prognostic Implication',
                    }),
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['8947bdb9-b77d-4fe4-a8a1-71dc7c41b1e4']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.PrognosticImplication,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            description: 'Prognostic Implication',
            levelOfEvidence: EvidenceLevelOfEvidenceEnum.LevelPx1,
            lastEdit: getTimeFromDateString('2003-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/diagnostic/level',
          updateTime: getTimeFromDateString('2004-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    diagnostic_uuid: '732e4ea5-0bf7-4795-a98e-4479ed19ab56',
                    diagnostic: createMockImplication({
                      level: DX_LEVELS.LEVEL_DX2,
                      description: 'Diagnostic Implication',
                    }),
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['732e4ea5-0bf7-4795-a98e-4479ed19ab56']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.DiagnosticImplication,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            description: 'Diagnostic Implication',
            levelOfEvidence: EvidenceLevelOfEvidenceEnum.LevelDx2,
            lastEdit: getTimeFromDateString('2004-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/TIs/0/treatments/0',
          updateTime: getTimeFromDateString('2002-01-01'),
          drugListRef: {
            ['a']: createMockDrug({
              uuid: '76c75f3b-364a-418c-8661-48768fb0742a',
              drugName: 'a',
              ncitCode: 'ANcitCode',
              ncitName: 'ANcitName',
              priority: 1,
            }),
            ['b']: createMockDrug({
              uuid: '8fbca1dc-0b71-47b1-8511-b5a5b8906616',
              drugName: 'b',
              ncitCode: 'BNcitCode',
              ncitName: 'BNcitName',
              priority: 2,
            }),
            ['c']: createMockDrug({
              uuid: '20329090-99ab-4769-8932-b93346331f57',
              drugName: 'c',
              ncitCode: 'CNcitCode',
              ncitName: 'CNcitName',
              priority: 3,
            }),
          },
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    TIs: [
                      createMockTi({
                        type: TI_TYPE.IS,
                        treatments: [
                          createMockTreatment({
                            name_uuid: '992bb496-7f19-4144-8664-3123756ad520',
                            name: 'a,b,c',
                            description: 'TI IS',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_1,
                            propagationLiquid: TX_LEVELS.LEVEL_4,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['992bb496-7f19-4144-8664-3123756ad520']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
            description: 'TI IS',
            fdaLevel: EvidenceLevelOfEvidenceEnum.LevelFda1,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            knownEffect: 'Sensitive',
            lastEdit: getTimeFromDateString('2002-01-01').toString(),
            levelOfEvidence: EvidenceLevelOfEvidenceEnum.Level1,
            liquidPropagationLevel: EvidenceLevelOfEvidenceEnum.Level4,
            solidPropagationLevel: EvidenceLevelOfEvidenceEnum.Level2,
            treatments: [
              {
                approvedIndications: [''],
                drugs: [
                  createMockDrug({
                    uuid: '76c75f3b-364a-418c-8661-48768fb0742a',
                    drugName: 'a',
                    ncitCode: 'ANcitCode',
                    ncitName: 'ANcitName',
                    priority: 1,
                  }),
                ],
                priority: 1,
              },
              {
                approvedIndications: [''],
                drugs: [
                  createMockDrug({
                    uuid: '8fbca1dc-0b71-47b1-8511-b5a5b8906616',
                    drugName: 'b',
                    ncitCode: 'BNcitCode',
                    ncitName: 'BNcitName',
                    priority: 1,
                  }),
                ],
                priority: 2,
              },
              {
                approvedIndications: [''],
                drugs: [
                  createMockDrug({
                    uuid: '20329090-99ab-4769-8932-b93346331f57',
                    drugName: 'c',
                    ncitCode: 'CNcitCode',
                    ncitName: 'CNcitName',
                    priority: 1,
                  }),
                ],
                priority: 3,
              },
            ],
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/0/tumors/0/summary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: [
              createMockMutation({
                tumors: [
                  createMockTumor({
                    summary_uuid: 'be434f6e-d6e9-4809-9951-b0aa89e7a32c',
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                  }),
                ],
              }),
            ],
          }),
        },
        {
          ['be434f6e-d6e9-4809-9951-b0aa89e7a32c']: {
            ...baseEvidence,
            evidenceType: EvidenceEvidenceTypeEnum.TumorTypeSummary,
            description: 'Tumor Type Summary',
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            lastEdit: getTimeFromDateString('2004-01-01').toString(),
          },
        },
      ],
    ];
    test.each(goodTests)('Path should map to evidences as expected for path %s', (pathArgs, expected) => {
      const args = pathToGetEvidenceArgs(pathArgs);
      expect(getEvidence(args)).toEqual(expected);
    });
  });
});
