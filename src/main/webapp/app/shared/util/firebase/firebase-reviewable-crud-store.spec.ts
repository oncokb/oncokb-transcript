const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});

import 'jest-expect-message';
import { FirebaseReviewableCrudStore } from './firebase-reviewable-crud-store';
import { FirebaseMetaStore } from 'app/stores/firebase/firebase.meta.store';
import FirebaseStore from 'app/stores/firebase/firebase.store';

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
  class TestRootStore {
    firebaseStore;
    firebaseMetaStore;
    authStore;
    constructor() {
      this.firebaseStore = new FirebaseStore(this as any);
      this.firebaseMetaStore = new FirebaseMetaStore(this as any);
      this.authStore = { fullName: 'test user' };
    }
  }

  let rootStore = undefined;
  const defaultDate = new Date('2023-01-01');

  const reset = () => {
    jest.useFakeTimers().setSystemTime(defaultDate);
    rootStore = new TestRootStore();
    jest.clearAllMocks();
  };

  describe('updateReviewableContent', () => {
    beforeEach(() => reset());

    it('should correctly update field that was already reviewed', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);
      store.data = { key: 'original', key_uuid: 'fake-uuid' };

      await store.updateReviewableContent('Gene/ABL1', 'key', 'new value');

      expect(mockUpdate).toHaveBeenCalled();

      // Check if field and field_review were updated
      // lastReviewed should be set because the field was already reviewed and we are making a new change
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({
        key: 'new value',
        key_review: { updateTime: defaultDate.getTime(), updatedBy: 'test user', lastReviewed: 'original' },
      });

      // Check if Meta information was updated
      expect(updateGeneMetaContentMock).toHaveBeenCalled();
      expect(updateGeneMetaContentMock.mock.calls[0][0]).toEqual('ABL1');

      // Check if we add uuid to meta
      expect(updateGeneReviewUuidMock).toHaveBeenCalled();
      expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'ABL1', 'fake-uuid', true);
    });

    it('should not update lastReviewed when it is present', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);
      store.data = { key: 'new value', key_uuid: 'fake-uuid', key_review: { lastReviewed: 'original' } };

      await store.updateReviewableContent('Gene/ABL1', 'key', 'new value 2');

      expect(mockUpdate).toHaveBeenCalled();

      // lastReviewed should not be updated because we it was already set
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({
        key: 'new value 2',
        key_review: { updateTime: defaultDate.getTime(), updatedBy: 'test user', lastReviewed: 'original' },
      });
    });

    it('should remove lastReviewed when value is reverted to original', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);
      store.data = {
        key: 'new value',
        key_uuid: 'fake-uuid',
        key_review: { lastReviewed: 'original', updatedBy: 'test user', updateTime: defaultDate.getTime() },
      };

      await store.updateReviewableContent('Gene/ABL1', 'key', 'original');

      expect(mockUpdate).toHaveBeenCalled();

      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({
        key: 'original',
        key_review: { updateTime: defaultDate.getTime(), updatedBy: 'test user', lastReviewed: 'original' },
      });

      // After successfull update to field, we expect the lastReviewed field to be removed
      expect(mockRef).toHaveBeenCalled();
      expect(mockRef).toHaveBeenNthCalledWith(2, undefined, `Gene/ABL1/key_review/lastReviewed`);
    });

    it('should remove uuid from meta when value is reverted to original', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);
      store.data = {
        key: 'new value',
        key_uuid: 'fake-uuid',
        key_review: { lastReviewed: 'original', updatedBy: 'test user', updateTime: defaultDate.getTime() },
      };

      await store.updateReviewableContent('Gene/ABL1', 'key', 'original');

      expect(mockUpdate).toHaveBeenCalled();

      // Check if we add uuid to meta
      expect(updateGeneReviewUuidMock).toHaveBeenCalled();
      expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'ABL1', 'fake-uuid', false);
    });

    it('should update timestamp and author', async () => {
      const store = new FirebaseReviewableCrudStore<any>(rootStore);
      store.data = {
        key: 'new value',
        key_uuid: 'fake-uuid',
        key_review: { lastReviewed: 'original', updatedBy: 'some user', updateTime: new Date('2020-01-01').getTime() },
      };

      await store.updateReviewableContent('Gene/ABL1', 'key', 'new value 2');

      expect(mockUpdate).toHaveBeenCalled();

      // lastReviewed should not be updated because it was already set
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({
        key: 'new value 2',
        key_review: { updateTime: defaultDate.getTime(), updatedBy: 'test user', lastReviewed: 'original' },
      });
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
