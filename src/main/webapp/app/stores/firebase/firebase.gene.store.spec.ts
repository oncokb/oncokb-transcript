const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});

import 'jest-expect-message';
import { FirebaseGeneStore } from './firebase.gene.store';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ONCOGENE, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import FirebaseStore from './firebase.store';

jest.mock('firebase/database', () => {
  return {
    ref: mockRef,
    update: mockUpdate,
    remove: mockRemove,
  };
});

const updateReviewableContentMock = jest.spyOn(FirebaseReviewableCrudStore.prototype, 'updateReviewableContent').mockResolvedValue();

class TestRootStore {
  firebaseStore;
  constructor() {
    this.firebaseStore = new FirebaseStore(this as any);
  }
}

describe('FirebaseGeneStore', () => {
  let rootStore = undefined;
  const defaultDate = new Date('2023-09-21');

  const reset = () => {
    jest.useFakeTimers().setSystemTime(defaultDate);
    rootStore = new TestRootStore();
    jest.clearAllMocks();
  };

  describe('updateGeneType', () => {
    beforeEach(() => reset());

    it('should add oncogene to gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Oncogene', true);
      expect(updateReviewableContentMock).toHaveBeenCalledTimes(1);
      expect(updateReviewableContentMock.mock.calls[0][0]).toEqual('Gene/ACKR3');
      expect(updateReviewableContentMock.mock.calls[0][1]).toEqual('type/ocg');
      expect(updateReviewableContentMock.mock.calls[0][2]).toEqual(ONCOGENE);
    });

    it('should add tumor suppressor to gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Tumor Suppressor', true);
      expect(updateReviewableContentMock).toHaveBeenCalledTimes(1);
      expect(updateReviewableContentMock.mock.calls[0][0]).toEqual('Gene/ACKR3');
      expect(updateReviewableContentMock.mock.calls[0][1]).toEqual('type/tsg');
      expect(updateReviewableContentMock.mock.calls[0][2]).toEqual(TUMOR_SUPPRESSOR);
    });

    it('should remove oncogene from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Oncogene', false);
      expect(updateReviewableContentMock).toHaveBeenCalledTimes(1);
      expect(updateReviewableContentMock.mock.calls[0][0]).toEqual('Gene/ACKR3');
      expect(updateReviewableContentMock.mock.calls[0][1]).toEqual('type/ocg');
      expect(updateReviewableContentMock.mock.calls[0][2]).toEqual('');
    });

    it('should remove tumor suppressor from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Tumor Suppressor', false);
      expect(updateReviewableContentMock).toHaveBeenCalledTimes(1);
      expect(updateReviewableContentMock.mock.calls[0][0]).toEqual('Gene/ACKR3');
      expect(updateReviewableContentMock.mock.calls[0][1]).toEqual('type/tsg');
      expect(updateReviewableContentMock.mock.calls[0][2]).toEqual('');
    });
  });
});
