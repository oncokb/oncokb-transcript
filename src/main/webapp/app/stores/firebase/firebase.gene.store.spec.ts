const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});

import 'jest-expect-message';
import { FirebaseGeneStore } from './firebase.gene.store';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import FirebaseStore from './firebase.store';
import { GENE_TYPE } from 'app/config/constants/firebase';

jest.mock('firebase/database', () => {
  return {
    ref: mockRef,
    update: mockUpdate,
    remove: mockRemove,
  };
});

// @ts-ignore: Type instantiation is excessively deep and possibly infinite.
// Complains because we have a recursive type to get all the keys starting from the Gene. We should see if we can
// improve the type or if there's another way to eliminate this warning message.
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

      await store.updateReviewableContent('Gene/ACKR3', 'type/ocg', true);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/ocg', GENE_TYPE.ONCOGENE);
    });

    it('should add tumor suppressor to gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateReviewableContent('Gene/ACKR3', 'type/tsg', true);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/tsg', GENE_TYPE.TUMOR_SUPPRESSOR);
    });

    it('should remove oncogene from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateReviewableContent('Gene/ACKR3', 'type/ocg', false);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/ocg', '');
    });

    it('should remove tumor suppressor from gene type', async () => {
      const store = new FirebaseGeneStore(rootStore);

      await store.updateReviewableContent('Gene/ACKR3', 'type/tsg', false);

      expect(updateReviewableContentMock).toHaveBeenNthCalledWith(1, 'Gene/ACKR3', 'type/tsg', '');
    });
  });
});
