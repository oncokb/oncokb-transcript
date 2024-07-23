import 'jest-expect-message';
import {
  compareFirebaseOncogenicities,
  compareMutationsByCategoricalAlteration,
  compareMutationsByProteinChangePosition,
  compareMutationsBySingleAlteration,
  geneNeedsReview,
  getCancerTypeStats,
  getFirebasePath,
  getMutationModifiedTimestamp,
  getMutationName,
  getMutationStats,
  getTxName,
  getValueByNestedKey,
  isNestedObjectEmpty,
  isSectionEmpty,
  sortByDxLevel,
  sortByPxLevel,
  sortByTxLevel,
} from './firebase-utils';
import {
  DX_LEVELS,
  FIREBASE_ONCOGENICITY,
  Gene,
  Meta,
  MetaReview,
  Mutation,
  PX_LEVELS,
  Review,
  TX_LEVELS,
  Treatment,
  Tumor,
} from 'app/shared/model/firebase/firebase.model';
import { generateUuid } from '../utils';
import { IDrug } from 'app/shared/model/drug.model';
import { MUTATION_EFFECT } from 'app/config/constants/constants';

describe('FirebaseUtils', () => {
  describe('getValueByNestedKey', () => {
    const obj = {
      summary_review: {
        lastUpdate: 1,
      },
    };

    it('should return nested property when given key', () => {
      const key = 'summary_review/lastUpdate';
      const value = getValueByNestedKey(obj, key);
      expect(value, 'key should return nested property').toEqual(1);
    });

    test.each([[''], [undefined]])('should return undefined when key is empty or undefined', key => {
      expect(getValueByNestedKey(obj, key)).toBeUndefined();
    });

    it('should return undefined when object is undefined', () => {
      const key = 'summary_review/lastUpdate';
      expect(getValueByNestedKey(undefined, key)).toBeUndefined();
    });
  });

  describe('getMutationName', () => {
    describe('When name and alteration prop are specified', () => {
      it('Mutation name is specified', () => {
        let mutation = {
          name: 'name',
          alterations: [
            {
              proteinChange: 'protein change',
              alteration: 'cdna',
              name: 'cdna (comment)',
            },
          ],
        } as Mutation;
        expect(
          getMutationName(mutation.name, mutation.alterations),
          'Mutation name should include both protein change and cdna when available',
        ).toEqual('cdna (comment) (p.protein change)');

        mutation = {
          name: 'name',
          alterations: [
            {
              proteinChange: 'protein change',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should include protein change').toEqual(
          'protein change',
        );

        mutation = {
          name: 'name',
          alterations: [
            {
              name: 'cdna',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should include cdna').toEqual('cdna');
      });
      it('Mutation name is NOT specified', () => {
        let mutation = {
          alterations: [
            {
              proteinChange: 'protein change',
              name: 'cdna (comment)',
              alteration: 'cdna',
            },
          ],
        } as Mutation;
        expect(
          getMutationName(mutation.name, mutation.alterations),
          'Mutation name should include both protein change and cdna when available',
        ).toEqual('cdna (comment) (p.protein change)');

        mutation = {
          alterations: [
            {
              proteinChange: 'protein change',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should include protein change').toEqual(
          'protein change',
        );

        mutation = {
          alterations: [
            {
              name: 'cdna',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should include cdna').toEqual('cdna');
      });
    });

    describe('When alteration prop is not specified', () => {
      it('Mutation name is specified', () => {
        const mutation = {
          name: 'name',
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should be used').toEqual('name');
      });
      it('Mutation name is NOT specified', () => {
        let mutation = {
          name: '',
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Default mutation name should be used').toEqual('(No Name)');
        mutation = {
          name: undefined,
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Default mutation name should be used').toEqual('(No Name)');
      });
    });
  });

  describe('getTxName', () => {
    describe('Check name format when the input is appropriate', () => {
      const drugList = [
        {
          uuid: 'uuid-1',
          name: 'drug-1',
        } as IDrug,
        {
          uuid: 'uuid-2',
          name: 'drug-2',
        } as IDrug,
      ];

      test.each([['uuid-1'], ['uuid-1 '], [' uuid-1']])('should return Tx name for one drug', input => {
        const expectedTxName = 'drug-1';
        expect(getTxName(drugList, input)).toEqual(expectedTxName);
      });

      test.each([['uuid-1+uuid-2'], ['uuid-1 +uuid-2'], ['uuid-1+ uuid-2'], ['uuid-1 + uuid-2']])(
        'should return Tx name for one tx with multiple drugs',
        input => {
          const expectedTxName = 'drug-1 + drug-2';
          expect(getTxName(drugList, input)).toEqual(expectedTxName);
        },
      );

      test.each([['uuid-1+uuid-2, uuid-1'], ['uuid-1+uuid-2,uuid-1'], ['uuid-1+uuid-2 , uuid-1'], ['uuid-1+uuid-2 ,uuid-1']])(
        'should return tx name for multiple tx and multiple drugs',
        input => {
          const expectedTxName = 'drug-1 + drug-2, drug-1';
          expect(getTxName(drugList, input)).toEqual(expectedTxName);
        },
      );
    });
    describe('Check name format when the input is inappropriate', () => {
      const drugList = [
        {
          uuid: 'uuid-1',
          name: 'drug-1',
        } as IDrug,
      ];
      it('Check when uuid is not in the drug list', () => {
        expect(getTxName(drugList, 'uuid-2'), 'Tx name is expected').toEqual('uuid-2');
        expect(getTxName(drugList, ' uuid-1, uuid-2'), 'Tx name is expected').toEqual('drug-1, uuid-2');
      });
      it('Check when tx uuid name is empty', () => {
        expect(getTxName(drugList, ''), 'Tx name is expected').toEqual('');
      });
    });
  });

  describe('geneNeedsReview', () => {
    let meta: Meta;
    beforeEach(() => {
      const metaReview: MetaReview = {
        currentReviewer: '',
      };
      meta = new Meta();
      meta.review = metaReview;
    });

    it('should return true when meta collection has uuid', () => {
      const uuid = generateUuid();
      meta.review[uuid] = true;
      expect(geneNeedsReview(meta)).toBeTruthy();
    });

    test.each([['not a uuid'], ['111-111-111-00000']])('should return false when uuid is invalid', uuid => {
      meta.review[uuid] = true;
      expect(geneNeedsReview(meta)).toBeFalsy();
    });

    test.each([[undefined], [null]])('should return false for nil inputs', input => {
      expect(geneNeedsReview(input)).toBeFalsy();
    });
  });

  describe('isNestedObjectEmpty', () => {
    test.each([
      [{}],
      [undefined],
      [null],
      [[]],
      [''],
      ['       '],
      [
        {
          key: '',
        },
      ],
      [
        {
          key: undefined,
          key2: [],
        },
      ],
      [
        {
          key: null,
          key2: '',
          obj: {
            nestedKey: [],
          },
        },
      ],
    ])('should return true', obj => {
      expect(isNestedObjectEmpty(obj)).toBeTruthy();
    });

    test.each([
      [{}, ['key_review']],
      [
        {
          key: null,
          key_review: 'review value',
        },
        ['key_review'],
      ],
      [
        {
          obj: { nestedKey: '', key_review: 'review value' },
        },
        ['key_review'],
      ],
    ])('should return true when given ignoredKeySubstrings', (obj, ignoreKeySubstrings) => {
      expect(isNestedObjectEmpty(obj, ignoreKeySubstrings)).toBeTruthy();
    });

    test.each([
      [
        {
          key: 'value',
        },
      ],
      [
        {
          key: ['value', 'value2'],
        },
      ],
      [
        {
          key: 0,
        },
      ],
      [
        {
          key: new Date().toString(),
        },
      ],
      [
        {
          key: 'value',
          key2: '',
        },
      ],
      [
        {
          key: 'value',
          obj: {
            nestedKey: undefined,
            nestedArray: [],
          },
        },
      ],
    ])('should return false', obj => {
      expect(isNestedObjectEmpty(obj)).toBeFalsy();
    });

    test.each([
      [
        {
          key: 'value',
          key_review: undefined,
        },
        ['_review'],
      ],
      [
        {
          key: 'value',
          key_review: undefined,
          obj: { nestedKey: 'value', key_review: '' },
        },
        ['_review'],
      ],
      [
        {
          key: 'value',
          key_uuid: '',
          key_review: undefined,
          obj: { nestedKey: 'value', key_review: '' },
        },
        ['_review', '_uuid'],
      ],
    ])('should return false when given ignoredKeySubstrings', (obj, ignoredKeySubstrings) => {
      expect(isNestedObjectEmpty(obj, ignoredKeySubstrings)).toBeFalsy();
    });
  });

  describe('isSectionEmpty', () => {
    it('should return true for mutation with only name field', () => {
      const firebasePath = getFirebasePath('MUTATIONS', 'BRAF', '0');
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      gene.mutations.push(mutation);

      expect(isSectionEmpty(gene, firebasePath), 'mutation has a name').toBeTruthy();
    });

    describe('should ignore certain fields when checking if empty', () => {
      let mutationPath;
      let mutation;

      beforeEach(() => {
        mutationPath = getFirebasePath('MUTATIONS', 'BRAF', '0');
        mutation = new Mutation('V600E');
      });

      it('should ignore review field', () => {
        expect(isSectionEmpty(mutation, mutationPath)).toBeTruthy();
      });

      it('should ignore uuid field when it is equal to empty string', () => {
        mutation.name_uuid = '';
        expect(isSectionEmpty(mutation, mutationPath)).toBeTruthy();
      });
    });

    describe('when checking if tumor section is empty', () => {
      let tumorPath;
      let tumor;

      beforeEach(() => {
        tumorPath = getFirebasePath('TUMORS', 'BRAF', '0', '0');
        tumor = new Tumor();
      });

      it('should return false when therapy is available', () => {
        tumor.TIs[0].treatments = [new Treatment('Vemurafenib')];
        expect(isSectionEmpty(tumor, tumorPath)).toBeFalsy();
      });

      it('should return false when tumor is not empty', () => {
        tumor.diagnosticSummary = 'Diagnostic Summary';
        expect(isSectionEmpty(tumor, tumorPath)).toBeFalsy();
      });

      it('should return true when no therapies or data available', () => {
        expect(isSectionEmpty(tumor, tumorPath)).toBeTruthy();
      });
    });
  });

  describe('sortByTxLevel', () => {
    const levels = [
      TX_LEVELS.LEVEL_3A,
      TX_LEVELS.LEVEL_R1,
      TX_LEVELS.LEVEL_1,
      TX_LEVELS.LEVEL_2,
      TX_LEVELS.LEVEL_3B,
      TX_LEVELS.LEVEL_4,
      TX_LEVELS.LEVEL_R2,
    ];

    test.each([
      [TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_R1, -1],
      [TX_LEVELS.LEVEL_R1, TX_LEVELS.LEVEL_2, -1],
      [TX_LEVELS.LEVEL_2, TX_LEVELS.LEVEL_3A, -1],
      [TX_LEVELS.LEVEL_3A, TX_LEVELS.LEVEL_3B, -1],
      [TX_LEVELS.LEVEL_3B, TX_LEVELS.LEVEL_4, -1],
      [TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_R2, -1],
      [TX_LEVELS.LEVEL_R2, TX_LEVELS.LEVEL_NO, -1],
    ])('should return higher priority tx level', (a, b, expected) => {
      expect(sortByTxLevel(a, b)).toEqual(expected);
    });

    it('should sort therapeutic levels ascending', () => {
      expect(levels.sort(sortByTxLevel)).toEqual([
        TX_LEVELS.LEVEL_1,
        TX_LEVELS.LEVEL_R1,
        TX_LEVELS.LEVEL_2,
        TX_LEVELS.LEVEL_3A,
        TX_LEVELS.LEVEL_3B,
        TX_LEVELS.LEVEL_4,
        TX_LEVELS.LEVEL_R2,
      ]);
    });

    it('should sort therapeutic levels descending', () => {
      expect(levels.sort((a, b) => sortByTxLevel(a, b, 'desc'))).toEqual([
        TX_LEVELS.LEVEL_R2,
        TX_LEVELS.LEVEL_4,
        TX_LEVELS.LEVEL_3B,
        TX_LEVELS.LEVEL_3A,
        TX_LEVELS.LEVEL_2,
        TX_LEVELS.LEVEL_R1,
        TX_LEVELS.LEVEL_1,
      ]);
    });
  });

  describe('sortByDxLevel', () => {
    const levels = [DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX1, DX_LEVELS.LEVEL_DX3];

    it('should sort diagnostic levels ascending', () => {
      expect(levels.sort(sortByDxLevel)).toEqual([DX_LEVELS.LEVEL_DX1, DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX3]);
    });

    it('should sort diagnostic levels descending', () => {
      expect(levels.sort((a, b) => sortByDxLevel(a, b, 'desc'))).toEqual([DX_LEVELS.LEVEL_DX3, DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX1]);
    });
  });

  describe('sortByPxLevel', () => {
    const levels = [PX_LEVELS.LEVEL_PX3, PX_LEVELS.LEVEL_PX1, PX_LEVELS.LEVEL_PX2];

    it('should sort prognostic levels ascending', () => {
      expect(levels.sort(sortByPxLevel)).toEqual([PX_LEVELS.LEVEL_PX1, PX_LEVELS.LEVEL_PX2, PX_LEVELS.LEVEL_PX3]);
    });

    it('should sort prognostic levels descending', () => {
      expect(levels.sort((a, b) => sortByPxLevel(a, b, 'desc'))).toEqual([PX_LEVELS.LEVEL_PX3, PX_LEVELS.LEVEL_PX2, PX_LEVELS.LEVEL_PX1]);
    });
  });

  describe('compareFirebaseOncogenicities', () => {
    const oncogencities = [
      FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
      FIREBASE_ONCOGENICITY.YES,
      FIREBASE_ONCOGENICITY.UNKNOWN,
      FIREBASE_ONCOGENICITY.INCONCLUSIVE,
    ];

    it('should sort firebase oncogencities ascending', () => {
      expect(oncogencities.sort(compareFirebaseOncogenicities)).toEqual([
        FIREBASE_ONCOGENICITY.YES,
        FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
        FIREBASE_ONCOGENICITY.INCONCLUSIVE,
        FIREBASE_ONCOGENICITY.UNKNOWN,
      ]);
    });

    it('should sort firebase oncogencities descending', () => {
      expect(oncogencities.sort((a, b) => compareFirebaseOncogenicities(a, b, 'desc'))).toEqual([
        FIREBASE_ONCOGENICITY.UNKNOWN,
        FIREBASE_ONCOGENICITY.INCONCLUSIVE,
        FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL,
        FIREBASE_ONCOGENICITY.YES,
      ]);
    });

    test.each([
      [FIREBASE_ONCOGENICITY.YES, FIREBASE_ONCOGENICITY.LIKELY],
      [FIREBASE_ONCOGENICITY.LIKELY, FIREBASE_ONCOGENICITY.RESISTANCE],
      [FIREBASE_ONCOGENICITY.RESISTANCE, FIREBASE_ONCOGENICITY.YES],
    ])('should have same priority', (o1, o2) => {
      expect(compareFirebaseOncogenicities(o1, o2)).toEqual(0);
    });
  });

  describe('compareMutationsBySingleAlteration', () => {
    test.each([
      [new Mutation('V600A'), new Mutation('V600A,V600B,V600C'), -1],
      [new Mutation('V600A,V600B'), new Mutation('V600A,V600B,V600C'), 0],
      [new Mutation('V600A'), new Mutation('V600B'), 0],
      [new Mutation('Oncogenic Mutations {excluding V600E}'), new Mutation('V600B'), 0],
    ])('should give priority to single alteration', (mut1, mut2, expected) => {
      expect(compareMutationsBySingleAlteration(mut1, mut2)).toEqual(expected);
    });
  });

  describe('compareMutationsByProteinChangePosition', () => {
    test.each([
      [new Mutation('V600E'), new Mutation('V700E'), -1],
      [new Mutation('V600E'), new Mutation('Amplification'), -1],
      [new Mutation('V600E'), new Mutation('A10'), 1],
      [new Mutation('B800'), new Mutation('T599_V600insV'), 1],
      [new Mutation('B599'), new Mutation('T599_V600insV'), 0],
      [new Mutation('B400'), new Mutation('T599_V600insV'), -1],
      [new Mutation('AKAP9-BRAF Fusion'), new Mutation('B1G'), 1],
      [new Mutation('AKAP1-BRAF Fusion'), new Mutation('B9G'), 1],
    ])('should compare mutations by protein change position', (mut1, mut2, expected) => {
      expect(compareMutationsByProteinChangePosition(mut1, mut2)).toEqual(expected);
    });
  });

  describe('compareMutationsByCategoricalAlteration', () => {
    test.each([
      [new Mutation('Oncogenic Mutations'), new Mutation('V700E'), -1],
      [new Mutation('Literally anything'), new Mutation('Amplification'), 1],
      [new Mutation('Truncating Mutations'), new Mutation('VUS'), 0],
    ])('should compare mutations correctly', (mut1, mut2, expected) => {
      expect(compareMutationsByCategoricalAlteration(mut1, mut2)).toEqual(expected);
    });
  });

  describe('getMutationModifedTimestamp', () => {
    it('should get most recent modified time', () => {
      const APR_1_2023 = 1680307200000;
      const JULY_3_2023 = 1688345678000;
      const OCT_1_2023 = 1696118400000;
      const JAN_1_2024 = 1709539200000;

      const mutation = new Mutation('');
      mutation.name_review = new Review('');
      mutation.name_review.updateTime = JULY_3_2023;
      mutation.alterations_review = new Review('');
      mutation.alterations_review.updateTime = APR_1_2023;

      const tumor = new Tumor();
      tumor.cancerTypes_review = new Review('');
      tumor.cancerTypes_review.updateTime = JAN_1_2024;

      const treatment = new Treatment('');
      treatment.description_review = new Review('');
      treatment.description_review.updateTime = OCT_1_2023;

      tumor.TIs[0].treatments = [treatment];
      mutation.tumors = [tumor];

      expect(getMutationModifiedTimestamp(mutation)).toBe(JAN_1_2024);
    });
  });

  describe('Get summary statistics', () => {
    const treatment1 = new Treatment('');
    treatment1.level = TX_LEVELS.LEVEL_2;
    const treatment2 = new Treatment('');
    treatment2.level = TX_LEVELS.LEVEL_EMPTY;
    const treatment3 = new Treatment('');
    treatment3.level = TX_LEVELS.LEVEL_2;

    const tumor1 = new Tumor();
    tumor1.diagnostic.level = DX_LEVELS.LEVEL_DX1;
    tumor1.TIs[0].treatments = [treatment1];
    tumor1.summary = 'summary';
    tumor1.diagnosticSummary = 'diagnostic';
    tumor1.prognosticSummary = 'prognostic';
    const tumor2 = new Tumor();
    tumor2.diagnostic.level = DX_LEVELS.LEVEL_DX2;
    tumor2.prognostic.level = PX_LEVELS.LEVEL_PX1;
    tumor2.TIs[1].treatments = [treatment2];
    tumor2.TIs[3].treatments = [treatment3];
    tumor2.prognosticSummary = 'prognostic';

    describe('getMutationStats', () => {
      it('should get the mutation stats', () => {
        const mutation = new Mutation('');
        mutation.mutation_effect.oncogenic = FIREBASE_ONCOGENICITY.LIKELY;
        mutation.mutation_effect.effect = MUTATION_EFFECT.NEUTRAL;

        mutation.tumors = [tumor1, tumor2];

        const expected = {
          TT: 2,
          oncogenicity: FIREBASE_ONCOGENICITY.LIKELY,
          mutationEffect: MUTATION_EFFECT.NEUTRAL,
          TTS: 1,
          DxS: 1,
          PxS: 2,
          txLevels: {
            [TX_LEVELS.LEVEL_2]: 2,
          },
          dxLevels: {
            [DX_LEVELS.LEVEL_DX1]: 1,
            [DX_LEVELS.LEVEL_DX2]: 1,
          },
          pxLevels: {
            [PX_LEVELS.LEVEL_PX1]: 1,
          },
        };

        expect(JSON.stringify(getMutationStats(mutation), null, 4)).toBe(JSON.stringify(expected, null, 4));
      });

      it('should return empty stats if mutation is null', () => {
        const expected = {
          TT: 0,
          oncogenicity: undefined,
          mutationEffect: undefined,
          TTS: 0,
          DxS: 0,
          PxS: 0,
          txLevels: {},
          dxLevels: {},
          pxLevels: {},
        };

        expect(JSON.stringify(getCancerTypeStats(null), null, 4)).toEqual(JSON.stringify(expected, null, 4));
      });
    });

    describe('getCancerTypeStats', () => {
      it('should get the cancer type stats', () => {
        const expected = {
          TT: 0,
          TTS: 0,
          DxS: 0,
          PxS: 1,
          txLevels: {
            [TX_LEVELS.LEVEL_2]: 1,
          },
          dxLevels: {
            [DX_LEVELS.LEVEL_DX2]: 1,
          },
          pxLevels: {
            [PX_LEVELS.LEVEL_PX1]: 1,
          },
        };

        expect(JSON.stringify(getCancerTypeStats(tumor2), null, 4)).toEqual(JSON.stringify(expected, null, 4));
      });

      it('should return empty stats if tumor is null', () => {
        const expected = {
          TT: 0,
          TTS: 0,
          DxS: 0,
          PxS: 0,
          txLevels: {},
          dxLevels: {},
          pxLevels: {},
        };
        expect(JSON.stringify(getCancerTypeStats(null), null, 4)).toEqual(JSON.stringify(expected, null, 4));
      });
    });
  });
});
