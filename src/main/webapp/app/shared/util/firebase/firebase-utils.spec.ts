import 'jest-expect-message';
import { convertNestedObject, geneNeedsReview, getMutationName, getTxName, getValueByNestedKey } from './firebase-utils';
import { Drug, Meta, MetaReview, Mutation } from 'app/shared/model/firebase/firebase.model';
import { generateUuid } from '../utils';

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
    describe('When alteration prop is specified', () => {
      it('Mutation name is specified', () => {
        let mutation = {
          name: 'name',
          alteration: {
            proteinChange: 'protein change',
            cDna: 'cdna',
          },
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include both protein change and cdna when available').toEqual(
          'protein change (cdna)'
        );

        mutation = {
          name: 'name',
          alteration: {
            proteinChange: 'protein change',
          },
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include protein change').toEqual('protein change');

        mutation = {
          name: 'name',
          alteration: {
            cDna: 'cdna',
          },
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include cdna').toEqual('cdna');
      });
      it('Mutation name is NOT specified', () => {
        let mutation = {
          alteration: {
            proteinChange: 'protein change',
            cDna: 'cdna',
          },
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include both protein change and cdna when available').toEqual(
          'protein change (cdna)'
        );

        mutation = {
          alteration: {
            proteinChange: 'protein change',
          },
        } as Mutation;
        expect(getMutationName(mutation), 'Mutation name should include protein change').toEqual('protein change');

        mutation = {
          alteration: {
            cDna: 'cdna',
          },
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
      const drugList = {
        'uuid-1': {
          drugName: 'drug-1',
        } as Drug,
        'uuid-2': {
          drugName: 'drug-2',
        } as Drug,
      };
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
      const drugList = {
        'uuid-1': {
          drugName: 'drug-1',
        } as Drug,
      };
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
});
