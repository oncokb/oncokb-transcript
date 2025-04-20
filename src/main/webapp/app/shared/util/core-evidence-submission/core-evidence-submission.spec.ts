import { DX_LEVELS, FDA_LEVELS, FIREBASE_ONCOGENICITY, PX_LEVELS, TI_TYPE, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getEvidence, pathToGetEvidenceArgs } from './core-evidence-submission';
import {
  Evidence,
  EvidenceEvidenceTypeEnum,
  EvidenceFdaLevelEnum,
  EvidenceLevelOfEvidenceEnum,
  EvidenceLiquidPropagationLevelEnum,
  EvidenceSolidPropagationLevelEnum,
  TumorType,
} from 'app/shared/api/generated/core';
import {
  createMockCancerType,
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
import { MUTATION_EFFECT } from 'app/config/constants/constants';
import { generateUuid } from '../utils';

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
    const tiIs = createMockTi({ type: TI_TYPE.IS, treatments: { '-txKey1': treatment } });
    const tiIr = createMockTi({ type: TI_TYPE.IR, treatments: { '-txKey1': treatment } });
    const tiSs = createMockTi({ type: TI_TYPE.SS, treatments: { '-txKey1': treatment } });
    const tiSr = createMockTi({ type: TI_TYPE.SR, treatments: { '-txKey1': treatment } });

    const tumor = createMockTumor({
      TIs: [tiIs, tiIr, tiSs, tiSr],
      cancerTypes: { [generateUuid()]: { code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() } },
      excludedCancerTypes: { [generateUuid()]: { code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() } },
      prognostic: createMockImplication({
        level: DX_LEVELS.LEVEL_DX1,
        excludedRCTs: { [generateUuid()]: { code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() } },
      }),
      prognosticSummary_review: createMockReview({}),

      diagnostic: createMockImplication({
        level: PX_LEVELS.LEVEL_PX1,
        excludedRCTs: { [generateUuid()]: { code: generateUuid(), subtype: generateUuid(), mainType: generateUuid() } },
      }),
      diagnosticSummary_review: createMockReview({}),
      summary: generateUuid(),
      summary_review: createMockReview({}),
      cancerTypes_review: createMockReview({}),
    });
    const mutation = createMockMutation({
      tumors: { '-tKey1': tumor },
      name_review: createMockReview({}),
      mutation_effect: createMockMutationEffect({
        effect_review: createMockReview({}),
        oncogenic_review: createMockReview({}),
        description_review: createMockReview({}),
        pathogenic_review: createMockReview({}),
      }),
    });
    const gene = createMockGene({
      mutations: { '-mKey1': mutation },
      summary_review: createMockReview({}),
      background_review: createMockReview({}),
    });

    const baseExpectedArgs: Pick<GetEvidenceArgs, 'drugListRef' | 'entrezGeneId' | 'updateTime' | 'gene'> = {
      drugListRef: {},
      entrezGeneId: Math.random(),
      updateTime: new Date().getTime(),
      gene,
    };

    type ArrayElement = [Parameters<typeof pathToGetEvidenceArgs>[0] & { valuePath: string }, args: Partial<GetEvidenceArgs> | undefined];

    const goodTests: ArrayElement[] = [
      [{ ...baseExpectedArgs, valuePath: 'mutations/-mKey1' }, undefined],
      // gene type change
      [{ ...baseExpectedArgs, valuePath: 'type' }, undefined],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/name' },
        {
          ...baseExpectedArgs,
          type: 'MUTATION_NAME_CHANGE',
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/summary' },
        {
          ...baseExpectedArgs,
          type: 'MUTATION_SUMMARY',
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/cancerTypes' },
        {
          ...baseExpectedArgs,
          type: 'TUMOR_NAME_CHANGE',
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/excludedCancerTypes' },
        {
          ...baseExpectedArgs,
          type: 'TUMOR_NAME_CHANGE',
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1/name' },
        {
          ...baseExpectedArgs,
          type: 'TREATMENT_NAME_CHANGE',
          tumor,
          mutation,
          gene,
          ti: tiIs,
          treatment,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'summary' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.GeneSummary },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'background' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.GeneBackground },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/mutation_effect/oncogenic' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.Oncogenic, mutation },
      ],
      [
        {
          ...baseExpectedArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/summary',
        },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.TumorTypeSummary, tumor, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/prognosticSummary' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.PrognosticSummary,
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/diagnosticSummary' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.DiagnosticSummary,
          tumor,
          mutation,
          gene,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/mutation_effect/effect' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.MutationEffect, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/mutation_effect/description' },
        { ...baseExpectedArgs, type: EvidenceEvidenceTypeEnum.MutationEffect, mutation },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/prognostic/level' },
        {
          ...baseExpectedArgs,
          type: EvidenceEvidenceTypeEnum.PrognosticImplication,
          tumor,
          mutation,
        },
      ],
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/diagnostic/level' },
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
          mutations: {
            '-mKey1': createMockMutation({
              ...mutation,
              tumors: {
                '-tKey1': createMockTumor({
                  ...tumor,
                  TIs: [createMockTi({ ...tiIs, treatments: { '-txKey1': createMockTreatment({ ...treatment, level }) } })],
                }),
              },
            }),
          },
        });
        return [
          {
            ...baseExpectedArgs,
            gene: newGene,
            valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1',
          },
          {
            ...baseExpectedArgs,
            type,
            tumor: newGene.mutations['-mKey1'].tumors['-tKey1'],
            mutation: newGene.mutations['-mKey1'],
            gene: newGene,
            ti: newGene.mutations['-mKey1'].tumors['-tKey1'].TIs[0],
            treatment: newGene.mutations['-mKey1'].tumors['-tKey1'].TIs[0].treatments['-txKey1'],
          },
        ];
      }),
      [
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/1/treatments/-txKey1/name' },
        {
          ...baseExpectedArgs,
          type: 'TREATMENT_NAME_CHANGE',
          tumor,
          mutation,
          gene,
          ti: tiIr,
          treatment,
        },
      ],
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
      ).map((key): ArrayElement => {
        const valuePath = `mutations/-mKey1/tumors/-tKey1/TIs/1/treatments/-txKey1/${key}`;
        if (key === 'short' || key === 'indication') {
          return [{ ...baseExpectedArgs, valuePath }, undefined];
        } else if (key === 'name') {
          return [
            { ...baseExpectedArgs, valuePath },
            {
              ...baseExpectedArgs,
              type: 'TREATMENT_NAME_CHANGE',
              tumor,
              mutation,
              ti: tiIr,
              treatment,
            },
          ];
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
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/2/treatments/-txKey1/fdaLevel' },
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
        { ...baseExpectedArgs, valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/3/treatments/-txKey1/fdaLevel' },
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
      ['mutations/-mKey1/bad'],
      ['mutations/-mKey300'],
      ['mutations/bad/-mKey1/mutation_effect/'],
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
      additionalInfo: null as unknown as undefined,
      alterations: null as unknown as undefined,
      articles: null as unknown as undefined,
      description: null as unknown as undefined,
      fdaLevel: null as unknown as undefined,
      knownEffect: null as unknown as undefined,
      levelOfEvidence: null as unknown as undefined,
      liquidPropagationLevel: null as unknown as undefined,
      solidPropagationLevel: null as unknown as undefined,
      treatments: null as unknown as undefined,
      cancerTypes: [],
      excludedCancerTypes: [],
      relevantCancerTypes: [],
    } as unknown as Evidence;

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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/prognosticSummary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    prognosticSummary_uuid: 'd9c991e4-1c13-4251-bd5a-fac0344b3470',
                    prognosticSummary: 'Prognostic Summary',
                    prognosticSummary_review: createMockReview({
                      lastReviewed: 'Prognostic Summary Last Reviewed',
                      updateTime: getTimeFromDateString('2002-01-01'),
                    }),
                    summary: 'Summary',
                    summary_review: createMockReview({
                      lastReviewed: 'Summary Last Reviewed',
                      updateTime: getTimeFromDateString('2002-01-01'),
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['d9c991e4-1c13-4251-bd5a-fac0344b3470']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/diagnosticSummary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    diagnosticSummary_uuid: 'a8ba8d36-ee0b-4e9c-ad3b-49137c271a82',
                    diagnosticSummary: 'Diagnostic Summary',
                    diagnosticSummary_review: createMockReview({
                      updateTime: getTimeFromDateString('2000-01-01'),
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['a8ba8d36-ee0b-4e9c-ad3b-49137c271a82']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/mutation_effect/effect',
          updateTime: getTimeFromDateString('2000-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  description: 'Mutation Effect',
                  effect_uuid: 'a7046e8d-af62-4284-a14d-fc145134529a',
                  oncogenic: FIREBASE_ONCOGENICITY.LIKELY,
                  effect: MUTATION_EFFECT.NEUTRAL,
                  effect_review: createMockReview({
                    updateTime: getTimeFromDateString('2002-01-01'),
                  }),
                  oncogenic_uuid: '8b076b49-5baa-4a74-90f1-c115a65b19e5',
                  oncogenic_review: createMockReview({
                    updateTime: getTimeFromDateString('2001-01-01'),
                  }),
                }),
              }),
            },
          }),
        },
        {
          ['a7046e8d-af62-4284-a14d-fc145134529a']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            evidenceType: EvidenceEvidenceTypeEnum.MutationEffect,
            description: 'Mutation Effect',
            knownEffect: MUTATION_EFFECT.NEUTRAL,
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
          valuePath: 'mutations/-mKey1/mutation_effect/oncogenic',
          updateTime: getTimeFromDateString('2000-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  description: 'Mutation Effect',
                  effect_uuid: 'a7046e8d-af62-4284-a14d-fc145134529a',
                  oncogenic: FIREBASE_ONCOGENICITY.LIKELY,
                  effect: MUTATION_EFFECT.NEUTRAL,
                  effect_review: createMockReview({
                    updateTime: getTimeFromDateString('2002-01-01'),
                  }),
                  oncogenic_uuid: '8b076b49-5baa-4a74-90f1-c115a65b19e5',
                  oncogenic_review: createMockReview({
                    lastReviewed: FIREBASE_ONCOGENICITY.YES,
                    updateTime: getTimeFromDateString('2001-01-01'),
                  }),
                }),
              }),
            },
          }),
        },
        {
          ['8b076b49-5baa-4a74-90f1-c115a65b19e5']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/mutation_effect/oncogenic',
          updateTime: getTimeFromDateString('2000-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  description: 'Mutation Effect',
                  effect_uuid: 'a7046e8d-af62-4284-a14d-fc145134529a',
                  oncogenic: FIREBASE_ONCOGENICITY.LIKELY,
                  effect: MUTATION_EFFECT.NEUTRAL,
                  effect_review: createMockReview({
                    updateTime: getTimeFromDateString('2002-01-01'),
                  }),
                  oncogenic_uuid: '8b076b49-5baa-4a74-90f1-c115a65b19e5',
                  oncogenic_review: createMockReview({
                    updateTime: getTimeFromDateString('2001-01-01'),
                  }),
                }),
              }),
            },
          }),
        },
        {
          ['8b076b49-5baa-4a74-90f1-c115a65b19e5']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/prognostic/level',
          updateTime: getTimeFromDateString('2003-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    prognostic_uuid: '8947bdb9-b77d-4fe4-a8a1-71dc7c41b1e4',
                    prognostic: createMockImplication({
                      level: PX_LEVELS.LEVEL_PX1,
                      description: 'Prognostic Implication',
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['8947bdb9-b77d-4fe4-a8a1-71dc7c41b1e4']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/diagnostic/level',
          updateTime: getTimeFromDateString('2004-01-01'),
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    diagnostic_uuid: '732e4ea5-0bf7-4795-a98e-4479ed19ab56',
                    diagnostic: createMockImplication({
                      level: DX_LEVELS.LEVEL_DX2,
                      description: 'Diagnostic Implication',
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['732e4ea5-0bf7-4795-a98e-4479ed19ab56']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1',
          updateTime: getTimeFromDateString('2002-01-01'),
          drugListRef: {
            ['76c75f3b-364a-418c-8661-48768fb0742a']: createMockDrug({
              uuid: '76c75f3b-364a-418c-8661-48768fb0742a',
              drugName: 'a',
              ncitCode: 'ANcitCode',
              ncitName: 'ANcitName',
              priority: 1,
            }),
            ['8fbca1dc-0b71-47b1-8511-b5a5b8906616']: createMockDrug({
              uuid: '8fbca1dc-0b71-47b1-8511-b5a5b8906616',
              drugName: 'b',
              ncitCode: 'BNcitCode',
              ncitName: 'BNcitName',
              priority: 2,
            }),
            ['20329090-99ab-4769-8932-b93346331f57']: createMockDrug({
              uuid: '20329090-99ab-4769-8932-b93346331f57',
              drugName: 'c',
              ncitCode: 'CNcitCode',
              ncitName: 'CNcitName',
              priority: 3,
            }),
          },
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    TIs: [
                      createMockTi({
                        type: TI_TYPE.IS,
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name_uuid: '992bb496-7f19-4144-8664-3123756ad520',
                            name: '76c75f3b-364a-418c-8661-48768fb0742a,8fbca1dc-0b71-47b1-8511-b5a5b8906616,20329090-99ab-4769-8932-b93346331f57',
                            description: 'TI IS',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_1,
                            propagationLiquid: TX_LEVELS.LEVEL_4,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          ['992bb496-7f19-4144-8664-3123756ad520']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
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
                approvedIndications: [],
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
                approvedIndications: [],
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
                approvedIndications: [],
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
          valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1',
          updateTime: getTimeFromDateString('2002-01-01'),
          drugListRef: {
            ['76c75f3b-364a-418c-8661-48768fb0742a']: createMockDrug({
              uuid: '76c75f3b-364a-418c-8661-48768fb0742a',
              drugName: 'a',
              ncitCode: 'ANcitCode',
              ncitName: 'ANcitName',
              priority: 1,
            }),
          },
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    TIs: [
                      createMockTi({
                        type: TI_TYPE.IS,
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name_uuid: '992bb496-7f19-4144-8664-3123756ad520',
                            name: '76c75f3b-364a-418c-8661-48768fb0742a',
                            description: 'TI IS',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_2,
                            level_review: createMockReview({
                              lastReviewed: TX_LEVELS.LEVEL_1,
                              updatedBy: 'John Doe',
                              updateTime: getTimeFromDateString('2001-01-01'),
                            }),
                            propagationLiquid: TX_LEVELS.LEVEL_4,
                            propagation: TX_LEVELS.LEVEL_2,
                            propagation_review: createMockReview({
                              lastReviewed: TX_LEVELS.LEVEL_4,
                              updatedBy: 'John Doe',
                              updateTime: getTimeFromDateString('2001-01-01'),
                            }),
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          ['992bb496-7f19-4144-8664-3123756ad520']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            evidenceType: EvidenceEvidenceTypeEnum.StandardTherapeuticImplicationsForDrugSensitivity,
            description: 'TI IS',
            fdaLevel: EvidenceLevelOfEvidenceEnum.LevelFda1,
            gene: {
              entrezGeneId: baseArgs.entrezGeneId,
              hugoSymbol,
            },
            knownEffect: 'Sensitive',
            lastEdit: getTimeFromDateString('2002-01-01').toString(),
            levelOfEvidence: EvidenceLevelOfEvidenceEnum.Level2,
            liquidPropagationLevel: EvidenceLevelOfEvidenceEnum.Level4,
            solidPropagationLevel: EvidenceLevelOfEvidenceEnum.Level2,
            treatments: [
              {
                approvedIndications: [],
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
            ],
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/summary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    summary_uuid: 'be434f6e-d6e9-4809-9951-b0aa89e7a32c',
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['be434f6e-d6e9-4809-9951-b0aa89e7a32c']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            evidenceType: EvidenceEvidenceTypeEnum.TumorTypeSummary,
            description: 'Tumor Type Summary',
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            lastEdit: getTimeFromDateString('2004-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/summary',
          gene: createMockGene({
            name: hugoSymbol,
            summary: '',
            summary_review: createMockReview({
              updateTime: getTimeFromDateString('2004-01-01'),
              lastReviewed: 'Ignore summary',
            }),
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    summary_uuid: 'be434f6e-d6e9-4809-9951-b0aa89e7a32c',
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                      lastReviewed: 'Tumor Type Summary Old',
                    }),
                  }),
                },
              }),
            },
          }),
        },
        {
          ['be434f6e-d6e9-4809-9951-b0aa89e7a32c']: {
            ...baseEvidence,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            evidenceType: EvidenceEvidenceTypeEnum.TumorTypeSummary,
            description: 'Tumor Type Summary',
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            lastEdit: getTimeFromDateString('2004-01-01').toString(),
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/name',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  oncogenic_uuid: 'afd5c3a0-930e-4cce-8bd5-66577ebac0eb',
                  effect_uuid: 'ceac443e-dc39-4f62-9e05-45b800326e18',
                }),
                tumors: {
                  '-tKey1': createMockTumor({
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                    summary_uuid: 'a264a9d7-69d5-47b2-9734-09a860dd9d9b',
                    prognosticSummary_uuid: '081d7177-83e9-4dae-96a1-fa869aec4b52',
                    diagnosticSummary_uuid: '1d36e653-2805-4b23-affc-e4b60f60d24c',
                    diagnostic_uuid: '7cb9656b-383d-49ef-92eb-35af6803a6f4',
                    prognostic_uuid: '70d937cc-1bb7-4315-9d4f-9a97cf9d728b',
                    TIs: [
                      createMockTi({
                        name_uuid: 'd8a2f58b-f9f2-462e-98b6-88ea866c636e',
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name: '20329090-99ab-4769-8932-b93346331f57',
                            name_uuid: 'd43e1f83-be01-43c2-bc1a-c020d204fbb1',
                            name_review: createMockReview({
                              updateTime: 0,
                            }),
                            description: 'Treatment Description',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_4,
                            propagationLiquid: TX_LEVELS.LEVEL_3A,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          // Mutation UUID's
          ['afd5c3a0-930e-4cce-8bd5-66577ebac0eb']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          ['ceac443e-dc39-4f62-9e05-45b800326e18']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          // tumor UUID's
          ['081d7177-83e9-4dae-96a1-fa869aec4b52']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          ['a264a9d7-69d5-47b2-9734-09a860dd9d9b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          ['1d36e653-2805-4b23-affc-e4b60f60d24c']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          ['7cb9656b-383d-49ef-92eb-35af6803a6f4']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          ['70d937cc-1bb7-4315-9d4f-9a97cf9d728b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
          // Treatment UUID's
          ['d43e1f83-be01-43c2-bc1a-c020d204fbb1']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/summary',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                summary: 'summary',
                summary_uuid: '73821fe9-27c4-46bf-a0c0-05a73cf5cf7b',
                mutation_effect: createMockMutationEffect({
                  oncogenic_uuid: 'afd5c3a0-930e-4cce-8bd5-66577ebac0eb',
                  effect_uuid: 'ceac443e-dc39-4f62-9e05-45b800326e18',
                }),
                tumors: {
                  '-tKey1': createMockTumor({
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                    summary_uuid: 'a264a9d7-69d5-47b2-9734-09a860dd9d9b',
                    prognosticSummary_uuid: '081d7177-83e9-4dae-96a1-fa869aec4b52',
                    diagnosticSummary_uuid: '1d36e653-2805-4b23-affc-e4b60f60d24c',
                    diagnostic_uuid: '7cb9656b-383d-49ef-92eb-35af6803a6f4',
                    prognostic_uuid: '70d937cc-1bb7-4315-9d4f-9a97cf9d728b',
                    TIs: [
                      createMockTi({
                        name_uuid: 'd8a2f58b-f9f2-462e-98b6-88ea866c636e',
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name: '20329090-99ab-4769-8932-b93346331f57',
                            name_uuid: 'd43e1f83-be01-43c2-bc1a-c020d204fbb1',
                            name_review: createMockReview({
                              updateTime: 0,
                            }),
                            description: 'Treatment Description',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_4,
                            propagationLiquid: TX_LEVELS.LEVEL_3A,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          // Mutation Summary UUID
          ['73821fe9-27c4-46bf-a0c0-05a73cf5cf7b']: {
            ...baseEvidence,
            description: 'summary',
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: 'MUTATION_SUMMARY',
            alterations: [
              {
                alteration: 'mutation',
                gene: {
                  hugoSymbol: 'ABL1',
                },
              },
            ],
            lastEdit: null as unknown as undefined,
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/cancerTypes',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  oncogenic_uuid: 'afd5c3a0-930e-4cce-8bd5-66577ebac0eb',
                  effect_uuid: 'ceac443e-dc39-4f62-9e05-45b800326e18',
                }),
                tumors: {
                  '-tKey1': createMockTumor({
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                    summary_uuid: 'a264a9d7-69d5-47b2-9734-09a860dd9d9b',
                    prognosticSummary_uuid: '081d7177-83e9-4dae-96a1-fa869aec4b52',
                    diagnosticSummary_uuid: '1d36e653-2805-4b23-affc-e4b60f60d24c',
                    diagnostic_uuid: '7cb9656b-383d-49ef-92eb-35af6803a6f4',
                    prognostic_uuid: '70d937cc-1bb7-4315-9d4f-9a97cf9d728b',
                    cancerTypes: {
                      '-ctKey1': createMockCancerType({
                        code: 'cancerTypeCode',
                        subtype: 'cancerTypeSubType',
                        mainType: 'cancerTypeMainType',
                      }),
                    },
                    excludedCancerTypes: {
                      '-ectKey1': createMockCancerType({
                        code: 'excludedCancerTypeCode',
                        subtype: 'excludedCancerTypeSubType',
                        mainType: 'excludedCancerTypeMainType',
                      }),
                    },
                    TIs: [
                      createMockTi({
                        name_uuid: 'd8a2f58b-f9f2-462e-98b6-88ea866c636e',
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name: '20329090-99ab-4769-8932-b93346331f57',
                            name_uuid: 'd43e1f83-be01-43c2-bc1a-c020d204fbb1',
                            name_review: createMockReview({
                              updateTime: 0,
                            }),
                            description: 'Treatment Description',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_4,
                            propagationLiquid: TX_LEVELS.LEVEL_3A,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          // tumor UUID's
          ['081d7177-83e9-4dae-96a1-fa869aec4b52']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['a264a9d7-69d5-47b2-9734-09a860dd9d9b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['1d36e653-2805-4b23-affc-e4b60f60d24c']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['7cb9656b-383d-49ef-92eb-35af6803a6f4']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['70d937cc-1bb7-4315-9d4f-9a97cf9d728b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          // Treatment UUID's
          ['d43e1f83-be01-43c2-bc1a-c020d204fbb1']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/excludedCancerTypes',
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                mutation_effect: createMockMutationEffect({
                  oncogenic_uuid: 'afd5c3a0-930e-4cce-8bd5-66577ebac0eb',
                  effect_uuid: 'ceac443e-dc39-4f62-9e05-45b800326e18',
                }),
                tumors: {
                  '-tKey1': createMockTumor({
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                    summary_uuid: 'a264a9d7-69d5-47b2-9734-09a860dd9d9b',
                    prognosticSummary_uuid: '081d7177-83e9-4dae-96a1-fa869aec4b52',
                    diagnosticSummary_uuid: '1d36e653-2805-4b23-affc-e4b60f60d24c',
                    diagnostic_uuid: '7cb9656b-383d-49ef-92eb-35af6803a6f4',
                    prognostic_uuid: '70d937cc-1bb7-4315-9d4f-9a97cf9d728b',
                    cancerTypes: {
                      '-ctKey1': createMockCancerType({
                        code: 'cancerTypeCode',
                        subtype: 'cancerTypeSubType',
                        mainType: 'cancerTypeMainType',
                      }),
                    },
                    excludedCancerTypes: {
                      '-ectKey1': createMockCancerType({
                        code: 'excludedCancerTypeCode',
                        subtype: 'excludedCancerTypeSubType',
                        mainType: 'excludedCancerTypeMainType',
                      }),
                    },
                    TIs: [
                      createMockTi({
                        name_uuid: 'd8a2f58b-f9f2-462e-98b6-88ea866c636e',
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name: '20329090-99ab-4769-8932-b93346331f57',
                            name_uuid: 'd43e1f83-be01-43c2-bc1a-c020d204fbb1',
                            name_review: createMockReview({
                              updateTime: 0,
                            }),
                            description: 'Treatment Description',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_4,
                            propagationLiquid: TX_LEVELS.LEVEL_3A,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          // tumor UUID's
          ['081d7177-83e9-4dae-96a1-fa869aec4b52']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['a264a9d7-69d5-47b2-9734-09a860dd9d9b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['1d36e653-2805-4b23-affc-e4b60f60d24c']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['7cb9656b-383d-49ef-92eb-35af6803a6f4']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          ['70d937cc-1bb7-4315-9d4f-9a97cf9d728b']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
          // Treatment UUID's
          ['d43e1f83-be01-43c2-bc1a-c020d204fbb1']: {
            ...baseEvidence,
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            evidenceType: null as unknown as undefined,
            lastEdit: null as unknown as undefined,
            cancerTypes: [
              {
                code: 'cancerTypeCode',
                subtype: 'cancerTypeSubType',
                mainType: 'cancerTypeMainType',
              } as TumorType,
            ],
            excludedCancerTypes: [
              {
                code: 'excludedCancerTypeCode',
                subtype: 'excludedCancerTypeSubType',
                mainType: 'excludedCancerTypeMainType',
              } as TumorType,
            ],
          },
        },
      ],
      [
        {
          ...baseArgs,
          valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1/name',
          drugListRef: {
            ['76c75f3b-364a-418c-8661-48768fb0742a']: createMockDrug({
              uuid: '76c75f3b-364a-418c-8661-48768fb0742a',
              drugName: 'a',
              ncitCode: 'ANcitCode',
              ncitName: 'ANcitName',
              priority: 1,
            }),
            ['8fbca1dc-0b71-47b1-8511-b5a5b8906616']: createMockDrug({
              uuid: '8fbca1dc-0b71-47b1-8511-b5a5b8906616',
              drugName: 'b',
              ncitCode: 'BNcitCode',
              ncitName: 'BNcitName',
              priority: 2,
            }),
            ['20329090-99ab-4769-8932-b93346331f57']: createMockDrug({
              uuid: '20329090-99ab-4769-8932-b93346331f57',
              drugName: 'c',
              ncitCode: 'CNcitCode',
              ncitName: 'CNcitName',
              priority: 3,
            }),
          },
          gene: createMockGene({
            name: hugoSymbol,
            mutations: {
              '-mKey1': createMockMutation({
                tumors: {
                  '-tKey1': createMockTumor({
                    summary: 'Tumor Type Summary',
                    summary_review: createMockReview({
                      updateTime: getTimeFromDateString('2004-01-01'),
                    }),
                    TIs: [
                      createMockTi({
                        treatments: {
                          '-txKey1': createMockTreatment({
                            name: '20329090-99ab-4769-8932-b93346331f57',
                            name_uuid: 'd43e1f83-be01-43c2-bc1a-c020d204fbb1',
                            name_review: createMockReview({
                              updateTime: 0,
                            }),
                            description: 'Treatment Description',
                            fdaLevel: FDA_LEVELS.LEVEL_FDA1,
                            level: TX_LEVELS.LEVEL_4,
                            propagationLiquid: TX_LEVELS.LEVEL_3A,
                            propagation: TX_LEVELS.LEVEL_2,
                          }),
                        },
                      }),
                    ],
                  }),
                },
              }),
            },
          }),
        },
        {
          ['d43e1f83-be01-43c2-bc1a-c020d204fbb1']: {
            ...baseEvidence,
            fdaLevel: EvidenceFdaLevelEnum.LevelFda1,
            evidenceType: null as unknown as undefined,
            description: 'Treatment Description',
            gene: { entrezGeneId: baseArgs.entrezGeneId, hugoSymbol },
            lastEdit: baseArgs.updateTime.toString(),
            levelOfEvidence: EvidenceLevelOfEvidenceEnum.Level4,
            liquidPropagationLevel: EvidenceLiquidPropagationLevelEnum.Level3A,
            solidPropagationLevel: EvidenceSolidPropagationLevelEnum.Level2,
            treatments: [
              {
                approvedIndications: [],
                drugs: [
                  createMockDrug({
                    uuid: '20329090-99ab-4769-8932-b93346331f57',
                    drugName: 'c',
                    ncitCode: 'CNcitCode',
                    ncitName: 'CNcitName',
                    priority: 1,
                  }),
                ],
                priority: 1,
              },
            ],
          },
        },
      ],
    ];
    test.each(goodTests)('Path should map to evidences as expected for path %s', (pathArgs, expected) => {
      const args = pathToGetEvidenceArgs(pathArgs);
      expect(getEvidence(args as GetEvidenceArgs)).toEqual(expected);
    });
  });
});

// describe('pathToDeleteEvidenceArgs', () => {
//   const gene = createMockGene({
//     mutations: {
//       '-mKey1': createMockMutation({
//         mutation_effect: createMockMutationEffect({
//           effect_uuid: '78676de8-1cfb-4865-b1ce-8bf757048f7b',
//           oncogenic_uuid: '4fb196f8-31ed-4834-9226-ccffa8b4fdd3',
//           pathogenic_uuid: 'a375d0bc-9d79-4522-bb12-de6b5545ba79',
//           description_uuid: '6f4e8643-d3db-4e18-bde8-fb75ac29a56b',
//         }),
//         tumors: {
//           '-tKey1': createMockTumor({
//             summary_uuid: 'df486ee9-6af3-4cef-9394-e9cbdf4226eb',
//             diagnostic_uuid: 'a8b6f194-6ab4-4702-9977-6b3f534d4ef4u',
//             prognostic_uuid: '00fb8a39-3e87-4c6e-8d81-8c9c64855e13',
//             cancerTypes_uuid: 'd5ff8db6-d0b2-49f3-911a-ba4d934341cf',
//             diagnosticSummary_uuid: 'ab9dae25-cf83-42df-8975-4373e018d941',
//             prognosticSummary_uuid: '798a5092-0294-49aa-b6e9-f12705334fc0',
//             excludedCancerTypes_uuid: '2070f39a-86fa-4953-a2d1-d3ba9298fe7b',
//             diagnostic: createMockImplication({
//               description_uuid: '44d840a1-a132-4a4f-a695-709e1cdf3333',
//               level_uuid: 'ebfbc714-cbb8-4ecd-ad8c-cc38f3b128b2',
//               excludedRCTs_uuid: '0a83cfc3-d7bf-455b-8ef3-a8c8956758ae',
//             }),
//             prognostic: createMockImplication({
//               description_uuid: 'bfa1635e-3880-41b2-979a-aad43ddc06d4',
//               level_uuid: 'e49a683c-e124-410b-a9a4-1ac20843339b',
//               excludedRCTs_uuid: '8d0c2a8d-42e5-4714-b516-f6f282f42eea',
//             }),
//             TIs: [
//               createMockTi({
//                 name_uuid: '985d587f-10bc-44a8-a260-5edc57ef0b70',
//                 treatments_uuid: '68317e32-66ec-46c1-8f62-046813706031',
//                 treatments: {
//                   '-txKey1': createMockTreatment({
//                     name_uuid: 'a36ec6af-7a3d-48cf-b841-de7412b88ef5',
//                     level_uuid: 'e46edf6e-ca0f-46ff-ac5c-e679389525e8',
//                     description_uuid: 'd6b9d84e-c940-42b0-bb05-f24472db24d4',
//                     indication_uuid: '82e7a319-c2ec-4001-8736-a39dda6dffd8',
//                     propagation_uuid: 'bebe734a-ca9c-465a-9297-30bb6610f721',
//                     excludedRCTs_uuid: 'f9635be0-900c-45f9-a192-4647e518996e',
//                     fdaLevel_uuid: 'e6126f59-c2bb-49b0-95b2-45577fad6a7b',
//                     propagationLiquid_uuid: '5f73012f-1eb2-4342-b40e-002d4219c3c5',
//                   }),
//                 },
//               }),
//             ],
//           }),
//         },
//       }),
//     },
//   });
//   const tests: [Parameters<typeof pathToDeleteEvidenceArgs>[0], Required<ReturnType<typeof pathToDeleteEvidenceArgs>>][] = [
//     [
//       {
//         valuePath: 'mutations/-mKey1',
//         gene,
//       },
//       [
//         '4fb196f8-31ed-4834-9226-ccffa8b4fdd3',
//         '78676de8-1cfb-4865-b1ce-8bf757048f7b',
//         'df486ee9-6af3-4cef-9394-e9cbdf4226eb',
//         '798a5092-0294-49aa-b6e9-f12705334fc0',
//         'ab9dae25-cf83-42df-8975-4373e018d941',
//         '00fb8a39-3e87-4c6e-8d81-8c9c64855e13',
//         'a8b6f194-6ab4-4702-9977-6b3f534d4ef4u',
//         'a36ec6af-7a3d-48cf-b841-de7412b88ef5',
//       ],
//     ],
//     [
//       {
//         valuePath: 'mutations/-mKey1/tumors/-tKey1',
//         gene,
//       },
//       [
//         'df486ee9-6af3-4cef-9394-e9cbdf4226eb',
//         '798a5092-0294-49aa-b6e9-f12705334fc0',
//         'ab9dae25-cf83-42df-8975-4373e018d941',
//         '00fb8a39-3e87-4c6e-8d81-8c9c64855e13',
//         'a8b6f194-6ab4-4702-9977-6b3f534d4ef4u',
//         'a36ec6af-7a3d-48cf-b841-de7412b88ef5',
//       ],
//     ],
//     [
//       {
//         valuePath: 'mutations/-mKey1/tumors/-tKey1/TIs/0/treatments/-txKey1',
//         gene,
//       },
//       ['a36ec6af-7a3d-48cf-b841-de7412b88ef5'],
//     ],
//     [
//       {
//         valuePath: 'name',
//         gene,
//       },
//       undefined,
//     ],
//   ];

//   test.each(tests)('Should map to payload correctly %j', (args, expected) => {
//     expect(pathToDeleteEvidenceArgs(args)).toEqual(expected);
//   });
// });
