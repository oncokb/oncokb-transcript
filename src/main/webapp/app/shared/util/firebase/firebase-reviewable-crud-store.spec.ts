const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});

import 'jest-expect-message';
import { FirebaseReviewableCrudStore } from './firebase-reviewable-crud-store';
import { FirebaseMetaStore } from 'app/stores/firebase/firebase.meta.store';

jest.mock('firebase/database', () => {
  return {
    ref: mockRef,
    update: mockUpdate,
    remove: mockRemove,
  };
});

const updateGeneMetaContentMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneMetaContent').mockReturnValue(Promise.resolve());
const updateGeneReviewUuidMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneReviewUuid').mockReturnValue(Promise.resolve());

describe('FirebaseReviewableCrudStore', () => {
  let rootStore = undefined;
  const metaStore = new FirebaseMetaStore(rootStore);
  const defaultDate = new Date('2023-09-21');

  const reset = () => {
    jest.useFakeTimers().setSystemTime(defaultDate);
    rootStore = { firebaseStore: {}, authStore: { fullName: 'test user' }, firebaseMetaStore: metaStore } as any;
    jest.clearAllMocks();
  };

  describe('updateReviewableContent', () => {
    beforeEach(() => reset());

    it('should update field and reviewable information', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);

      await store.updateReviewableContent('Gene/ABL1', 'key', 'value');

      expect(mockUpdate).toHaveBeenCalled();

      // Check if field and field_review were updated
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({ key: 'value', key_review: { updateTime: defaultDate.getTime(), updatedBy: 'test user' } });

      // Check if Meta information was updated
      expect(updateGeneMetaContentMock).toHaveBeenCalled();
      expect(updateGeneMetaContentMock.mock.calls[0][0]).toEqual('ABL1');

      // Check if we add uuid to meta
      expect(updateGeneReviewUuidMock).toHaveBeenCalled();
      expect(updateGeneReviewUuidMock.mock.calls[0][0]).toEqual('ABL1');
      expect(updateGeneReviewUuidMock.mock.calls[0][1]).toEqual('key_uuid');
      expect(updateGeneReviewUuidMock.mock.calls[0][2]).toEqual(true);
    });

    it('should not update when path does not contain hugoSymbol', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);

      await expect(store.updateReviewableContent('Gene', 'key', 'value')).rejects.toThrow();

      expect(mockUpdate).toHaveBeenCalledTimes(0);
      expect(updateGeneMetaContentMock).toHaveBeenCalledTimes(0);
      expect(updateGeneReviewUuidMock).toHaveBeenCalledTimes(0);
    });
  });
});
