import 'jest-expect-message';
import { convertNestedObject, geneNeedsReview, getValueByNestedKey } from './firebase-utils';
import { Meta, MetaReview } from 'app/shared/model/firebase/firebase.model';
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
