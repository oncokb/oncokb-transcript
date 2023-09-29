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
  const DEFAULT_DATE = new Date('2023-01-01');

  const reset = () => {
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
    rootStore = new TestRootStore();
    jest.clearAllMocks();
  };

  describe('updateGeneType', () => {
    beforeEach(() => reset());

    it('should add oncogene to gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Oncogene', true);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/ocg', ONCOGENE);
    });

    it('should add tumor suppressor to gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Tumor Suppressor', true);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/tsg', TUMOR_SUPPRESSOR);
    });

    it('should remove oncogene from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Oncogene', false);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/ocg', '');
    });

    it('should remove tumor suppressor from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateGeneType('Gene/ACKR3', 'Tumor Suppressor', false);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/tsg', '');
    });
  });
});
