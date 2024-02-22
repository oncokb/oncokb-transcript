import 'jest-expect-message';
import {
  convertNestedObject,
  geneNeedsReview,
  getFirebasePath,
  getMutationName,
  getTxName,
  getValueByNestedKey,
  isNestedObjectEmpty,
  isSectionEmpty,
  isSectionRemovableWithoutReview,
  sortByTxLevel,
} from './firebase-utils';
import { Gene, Meta, MetaReview, Mutation, Review, TX_LEVELS, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import { generateUuid } from '../utils';
import { NestLevelType } from 'app/pages/curation/collapsible/NestLevel';
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
        expect(getMutationName(mutation), 'Mutation name should include both protein change and cdna when available').toEqual(
          'cdna (comment) (p.protein change)'
        );

        mutation = {
          name: 'name',
          alterations: [
            {
              proteinChange: 'protein change',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include protein change').toEqual('protein change');

        mutation = {
          name: 'name',
          alterations: [
            {
              name: 'cdna',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include cdna').toEqual('cdna');
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
        expect(getMutationName(mutation), 'Mutation name should include both protein change and cdna when available').toEqual(
          'cdna (comment) (p.protein change)'
        );

        mutation = {
          alterations: [
            {
              proteinChange: 'protein change',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include protein change').toEqual('protein change');

        mutation = {
          alterations: [
            {
              name: 'cdna',
            },
          ],
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include cdna').toEqual('cdna');
      });
    });

    describe('When alteration prop is not specified', () => {
      it('Mutation name is specified', () => {
        const mutation = {
          name: 'name',
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should be used').toEqual('name');
      });
      it('Mutation name is NOT specified', () => {
        let mutation = {
          name: '',
        } as Mutation;
        expect(getMutationName(mutation), 'Default mutation name should be used').toEqual('(No Name)');
        mutation = {
          name: undefined,
        } as Mutation;
        expect(getMutationName(mutation), 'Default mutation name should be used').toEqual('(No Name)');
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

  describe('isSectionRemovableWithoutReview', () => {
    it('mutation should be removable', () => {
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review('user', undefined, true);
      gene.mutations.push(mutation);

      const isRemovable = isSectionRemovableWithoutReview(gene, NestLevelType.MUTATION, getFirebasePath('MUTATIONS', 'BRAF', '0'));
      expect(isRemovable).toBeTruthy();
    });

    it('mutation needs to be reviewed', () => {
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review('user');
      gene.mutations.push(mutation);

      const isRemovable = isSectionRemovableWithoutReview(gene, NestLevelType.MUTATION, getFirebasePath('MUTATIONS', 'BRAF', '0'));
      expect(isRemovable).toBeFalsy();
    });

    it('tumor should be removable', () => {
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review('user');
      gene.mutations.push(mutation);
      const tumor = new Tumor();
      tumor.cancerTypes_review = new Review('user', undefined, true);
      mutation.tumors.push(tumor);

      const isRemovable = isSectionRemovableWithoutReview(gene, NestLevelType.CANCER_TYPE, getFirebasePath('TUMORS', 'BRAF', '0', '0'));
      expect(isRemovable).toBeTruthy();
    });

    it('tumor needs to be reviewed', () => {
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review('user');
      gene.mutations.push(mutation);
      const tumor = new Tumor();
      tumor.cancerTypes_review = new Review('user');
      mutation.tumors.push(tumor);

      const isRemovable = isSectionRemovableWithoutReview(gene, NestLevelType.CANCER_TYPE, getFirebasePath('TUMORS', 'BRAF', '0', '0'));
      expect(isRemovable).toBeFalsy();
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
    it('should return false when one or more fields have values', () => {
      const firebasePath = getFirebasePath('MUTATIONS', 'BRAF', '0');
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      gene.mutations.push(mutation);

      expect(isSectionEmpty(gene, firebasePath), 'mutation has a name').toBeFalsy();
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

    it('should check treatments when determining whether tumor section is empty', () => {
      const firebasePath = getFirebasePath('TUMORS', 'BRAF', '0', '0');
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600');
      gene.mutations.push(mutation);

      const tumor = new Tumor();
      mutation.tumors.push(tumor);

      // Tumor is empty, but TIs has a therapy available
      tumor.TIs[0].treatments = [new Treatment('Vemurafenib')];
      expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

      // Tumor is not empty
      tumor.diagnosticSummary = 'Diagnostic Summary';
      expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

      // Tumor is not empty and no therapies available
      tumor.TIs[0].treatments = [];
      expect(isSectionEmpty(gene, firebasePath)).toBeFalsy();

      // Tumor is empty and no therapies avaiable
      tumor.diagnosticSummary = '';
      expect(isSectionEmpty(gene, firebasePath)).toBeTruthy();
    });
  });

  describe('sortByTxLevel', () => {
    it('should sort therapeutic levels', () => {
      expect(sortByTxLevel(TX_LEVELS.LEVEL_1, TX_LEVELS.LEVEL_R1)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_R1, TX_LEVELS.LEVEL_2)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_2, TX_LEVELS.LEVEL_3A)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_3A, TX_LEVELS.LEVEL_3B)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_3B, TX_LEVELS.LEVEL_4)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_4, TX_LEVELS.LEVEL_R2)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_R2, TX_LEVELS.LEVEL_R3)).toEqual(-1);
      expect(sortByTxLevel(TX_LEVELS.LEVEL_R2, TX_LEVELS.LEVEL_NO)).toEqual(-1);
    });
  });
});
