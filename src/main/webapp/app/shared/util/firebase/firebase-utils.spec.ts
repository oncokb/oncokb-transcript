import 'jest-expect-message';
import {
  compareFirebaseOncogenicities,
  compareMutationsByCategoricalAlteration,
  compareMutationsByOncogenicity,
  compareMutationsByProteinChangePosition,
  compareMutationsBySingleAlteration,
  convertNestedObject,
  geneNeedsReview,
  getFirebasePath,
  getMutationName,
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
  TX_LEVELS,
} from 'app/shared/model/firebase/firebase.model';
import { generateUuid } from '../utils';
import { IDrug } from 'app/shared/model/drug.model';

describe('FirebaseUtils', () => {
  describe('convertNestedObject', () => {
    it('converts a nested objects key into one that is seperated by a slash', () => {
      const obj = {
        name: 'ABL1',
        type: {
          ocg: 'Oncogene',
        },
      };

      const convertedObj = convertNestedObject(obj, '', {});
      expect(convertedObj, 'non-nested property should be present').toHaveProperty('name', 'ABL1');
      expect(convertedObj, 'nested properties should be joined by a slash').toHaveProperty('type/ocg', 'Oncogene');

      const emptyObj = {};
      const convertedEmptyObj = convertNestedObject(emptyObj, '', {});
      expect(convertedEmptyObj, 'empty object should return empty object').toEqual({});
    });
  });

  describe('getValueByNestedKey', () => {
    it('gets value from object using nested key', () => {
      const key = 'summary_review/lastUpdate';
      const obj = {
        summary_review: {
          lastUpdate: 1,
        },
      };

      const value = getValueByNestedKey(obj, key);
      expect(value, 'key should return nested property').toEqual(1);

      // Edge cases
      expect(getValueByNestedKey(obj, ''), 'empty key should return undefined').toBeUndefined();
      expect(getValueByNestedKey(obj, undefined), 'undefined key should return undefined').toBeUndefined();
      expect(getValueByNestedKey(undefined, key), 'undefined object should return undefined').toBeUndefined();
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
          'Mutation name should include both protein change and cdna when available'
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
          'protein change'
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
          'Mutation name should include both protein change and cdna when available'
        ).toEqual('cdna (comment) (p.protein change)');

        mutation = {
          alterations: [
            {
              proteinChange: 'protein change',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation.name, mutation.alterations), 'Mutation name should include protein change').toEqual(
          'protein change'
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
      it('String with one drug', () => {
        const expectedTxName = 'drug-1';
        expect(getTxName(drugList, 'uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1 '), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, ' uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
      });
      it('String with one tx but multiple drugs', () => {
        const expectedTxName = 'drug-1 + drug-2';
        expect(getTxName(drugList, 'uuid-1+uuid-2'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1 +uuid-2'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1+ uuid-2'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1 + uuid-2'), 'Tx name is appropriate').toEqual(expectedTxName);
      });
      it('String with multiple tx and multiple drugs', () => {
        const expectedTxName = 'drug-1 + drug-2, drug-1';
        expect(getTxName(drugList, 'uuid-1+uuid-2, uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1+uuid-2,uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1+uuid-2 , uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
        expect(getTxName(drugList, 'uuid-1+uuid-2 ,uuid-1'), 'Tx name is appropriate').toEqual(expectedTxName);
      });
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
    it('checks if a gene needs to be review based on meta object', () => {
      const uuid = generateUuid();
      const metaReview: MetaReview = {
        currentReviewer: '',
        [uuid]: true,
      };
      const meta = new Meta();
      meta.review = metaReview;

      // Valid uuid
      expect(geneNeedsReview(meta), 'should return true because uuid is present').toBe(true);

      // Invalid UUID
      let nonUuid = 'not a uuid';
      meta.review = {
        currentReviewer: '',
        [nonUuid]: true,
      };
      expect(geneNeedsReview(meta), 'should return false because not a valid uuid').toBe(false);

      nonUuid = '111-111-111-00000';
      expect(geneNeedsReview(meta), 'should return false because not a valid uuid').toBe(false);

      // Edge cases
      expect(geneNeedsReview(undefined), 'undefined input should return false').toBe(false);
    });
  });

  describe('isNestedObjectEmpty', () => {
    it('should return true', () => {
      let testObject = {};
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = undefined;
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = null;
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = [];
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = '';
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = '    ';
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = {
        key: '',
      };
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = {
        key: undefined,
        key2: [],
      };
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      testObject = {
        key: null,
        key2: '',
        obj: {
          nestedKey: [],
        },
      };
      expect(isNestedObjectEmpty(testObject)).toBeTruthy();

      // With ignoredKeySubstrings parameter
      testObject = {};
      expect(isNestedObjectEmpty(testObject, ['key_review'])).toBeTruthy();

      testObject = {
        key: null,
        key_review: 'review value',
      };
      expect(isNestedObjectEmpty(testObject, ['key_review'])).toBeTruthy();

      testObject = {
        obj: { nestedKey: '', key_review: 'review value' },
      };
      expect(isNestedObjectEmpty(testObject, ['key_review'])).toBeTruthy();
    });

    it('should return false', () => {
      let testObject: any = {
        key: 'value',
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      testObject = {
        key: ['value', 'value2'],
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      testObject = {
        key: 0,
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      testObject = {
        key: new Date().toString(),
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      testObject = {
        key: 'value',
        key2: '',
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      testObject = {
        key: 'value',
        obj: {
          nestedKey: undefined,
          nestedArray: [],
        },
      };
      expect(isNestedObjectEmpty(testObject)).toBeFalsy();

      // With ignoredKeySubstrings parameter
      testObject = {
        key: 'value',
        key_review: undefined,
      };
      expect(isNestedObjectEmpty(testObject, ['_review'])).toBeFalsy();

      testObject = {
        key: 'value',
        key_review: undefined,
        obj: { nestedKey: 'value', key_review: '' },
      };
      expect(isNestedObjectEmpty(testObject, ['_review'])).toBeFalsy();
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

    it('should ignore review and uuid fields', () => {
      const firebasePath = getFirebasePath('MUTATIONS', 'BRAF', '0');
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name = '';
      gene.mutations.push(mutation);

      expect(isSectionEmpty(gene, firebasePath), 'review field should be ignored').toBeTruthy();

      mutation.name_uuid = '';
      expect(isSectionEmpty(gene, firebasePath), 'uuid field should be ignored').toBeTruthy();

      mutation.name_uuid = undefined;
      expect(isSectionEmpty(gene, firebasePath), 'uuid field should be ignored').toBeTruthy();
    });

    // it('should check treatments when determining whether tumor section is empty', () => {
    //   const firebasePath = getFirebasePath('TUMORS', 'BRAF', '0', '0');
    //   const gene = new Gene('BRAF');
    //   const mutation = new Mutation('V600');
    //   gene.mutations.push(mutation);

    //   const tumor = new Tumor();
    //   mutation.tumors.push(tumor);

    //   // Tumor is empty, but TIs has a therapy available
    //   tumor.TIs[0].treatments = [new Treatment('Vemurafenib')];
    // //   expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

    //   // Tumor is not empty
    //   tumor.diagnosticSummary = 'Diagnostic Summary';
    //   expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

    //   // Tumor is not empty and no therapies available
    //   tumor.TIs[0].treatments = [];
    //   expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

    //   // Tumor is empty and no therapies avaiable
    //   tumor.diagnosticSummary = '';
    //   expect(isSectionEmpty(gene, firebasePath)).toBeTruthy();
    // });
  });

  describe('sortByTxLevel', () => {
    it('should compare therapeutic indexes using ascending', () => {
      expect(sortByTxLevel(TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_R1)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_R1, TX_LEVELS.LEVEL_2)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_2, TX_LEVELS.LEVEL_3A)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_3A, TX_LEVELS.LEVEL_3B)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_3B, TX_LEVELS.LEVEL_4)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_R2)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_R2, TX_LEVELS.LEVEL_NO)).toEqual(-1);
    });

    const levels = [
      TX_LEVELS.LEVEL_3A,
      TX_LEVELS.LEVEL_R1,
      TX_LEVELS.LEVEL_1,
      TX_LEVELS.LEVEL_2,
      TX_LEVELS.LEVEL_3B,
      TX_LEVELS.LEVEL_4,
      TX_LEVELS.LEVEL_R2,
    ];

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

    it('should have the same priority', () => {
      expect(compareFirebaseOncogenicities(FIREBASE_ONCOGENICITY.YES, FIREBASE_ONCOGENICITY.LIKELY)).toEqual(0);
      expect(compareFirebaseOncogenicities(FIREBASE_ONCOGENICITY.LIKELY, FIREBASE_ONCOGENICITY.RESISTANCE)).toEqual(0);
      expect(compareFirebaseOncogenicities(FIREBASE_ONCOGENICITY.RESISTANCE, FIREBASE_ONCOGENICITY.YES)).toEqual(0);
    });
  });

  describe('compareMutationsBySingleAlteration', () => {
    it('should give priority to single alteration', () => {
      expect(compareMutationsBySingleAlteration(new Mutation('V600A'), new Mutation('V600A,V600B,V600C'))).toBeLessThan(0);

      expect(compareMutationsBySingleAlteration(new Mutation('V600A,V600B'), new Mutation('V600A,V600B,V600C'))).toEqual(0);
      expect(compareMutationsBySingleAlteration(new Mutation('V600A'), new Mutation('V600B'))).toEqual(0);
      expect(compareMutationsBySingleAlteration(new Mutation('Oncogenic Mutations {excluding V600E}'), new Mutation('V600B'))).toEqual(0);
    });
  });

  describe('compareMutationsByProteinChangePosition', () => {
    it('should compare mutations correctly', () => {
      expect(compareMutationsByProteinChangePosition(new Mutation('V600E'), new Mutation('V700E'))).toBeLessThan(0);

      // No number to match, so go after
      expect(compareMutationsByProteinChangePosition(new Mutation('V600E'), new Mutation('Amplification'))).toBeLessThan(0);

      expect(compareMutationsByProteinChangePosition(new Mutation('V600E'), new Mutation('A10'))).toBeGreaterThan(0);

      // Use start position as position
      expect(compareMutationsByProteinChangePosition(new Mutation('B800'), new Mutation('T599_V600insV'))).toBeGreaterThan(0);
      expect(compareMutationsByProteinChangePosition(new Mutation('B599'), new Mutation('T599_V600insV'))).toEqual(0);
      expect(compareMutationsByProteinChangePosition(new Mutation('B400'), new Mutation('T599_V600insV'))).toBeLessThan(0);

      // Anything ending in "Fusion" should go after, even if there is a number
      expect(compareMutationsByProteinChangePosition(new Mutation('AKAP9-BRAF Fusion'), new Mutation('B1G'))).toBeGreaterThan(0);
      expect(compareMutationsByProteinChangePosition(new Mutation('AKAP1-BRAF Fusion'), new Mutation('B9G'))).toBeGreaterThan(0);
    });
  });

  describe('compareMutationsByCategoricalAlteration', () => {
    it('should compare mutations correctly', () => {
      expect(compareMutationsByCategoricalAlteration(new Mutation('Oncogenic Mutations'), new Mutation('V700E'))).toBeLessThan(0);
      expect(compareMutationsByCategoricalAlteration(new Mutation('Literally anything'), new Mutation('Amplification'))).toBeGreaterThan(0);
      expect(compareMutationsByCategoricalAlteration(new Mutation('Truncating Mutations'), new Mutation('VUS'))).toEqual(0);
    });
  });
});
