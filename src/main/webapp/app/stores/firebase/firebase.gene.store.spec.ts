const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});
const mockRunTransaction = jest.fn().mockImplementation((db, transactionUpdate) => {});
const mockUuidReturnValue = 'fake-uuid';

import 'jest-expect-message';
import { FirebaseGeneStore } from './firebase.gene.store';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { CancerType, Gene, Mutation, Review, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import { FirebaseMetaStore } from './firebase.meta.store';
import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import FirebaseStore from './firebase.store';
import { NestLevelType } from 'app/pages/curation/collapsible/NestLevel';

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue(mockUuidReturnValue) }));

jest.mock('firebase/database', () => {
  return {
    ref: mockRef,
    update: mockUpdate,
    remove: mockRemove,
    runTransaction: mockRunTransaction,
  };
});

const deleteFromArrayMock = jest.spyOn(FirebaseCrudStore.prototype, 'deleteFromArray').mockReturnValue(Promise.resolve(undefined));
const updateGeneMetaContentMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneMetaContent').mockReturnValue(Promise.resolve());
const updateGeneReviewUuidMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneReviewUuid').mockReturnValue(Promise.resolve());

describe('FirebaseGeneStore', () => {
  // Variables used in tests
  let rootStore = undefined;
  const DEFAULT_USER = 'test user';
  const DEFAULT_DATE = new Date('2023-09-21');

  class TestRootStore {
    firebaseStore;
    firebaseMetaStore;
    authStore;
    constructor() {
      this.firebaseStore = new FirebaseStore(this as any);
      this.firebaseMetaStore = new FirebaseMetaStore(this as any);
      this.authStore = { fullName: DEFAULT_USER };
    }
  }

  const reset = () => {
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
    rootStore = new TestRootStore();
    jest.clearAllMocks();
  };

  describe('deleteSection', () => {
    beforeEach(() => reset());

    it('should delete immediately when content has been added', async () => {
      const store = new FirebaseGeneStore(rootStore);
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review(DEFAULT_USER, undefined, true);
      gene.mutations.push(mutation);
      store.data = gene;
      await store.deleteSection(NestLevelType.MUTATION, getFirebasePath('MUTATIONS', 'BRAF', '0'));

      expect(deleteFromArrayMock).toHaveBeenNthCalledWith(1, 'Genes/BRAF/mutations', [0]);

      expect(updateGeneMetaContentMock).toHaveBeenCalledTimes(0);
      expect(updateGeneReviewUuidMock).toHaveBeenCalledTimes(0);
    });

    it('should review before deleting mutation', async () => {
      const store = new FirebaseGeneStore(rootStore);
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review(DEFAULT_USER);
      gene.mutations.push(mutation);
      store.data = gene;
      await store.deleteSection(NestLevelType.MUTATION, getFirebasePath('MUTATIONS', 'BRAF', '0'));

      expect(deleteFromArrayMock).toHaveBeenCalledTimes(0);

      expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
        name_review: { removed: true, updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
      });

      expect(updateGeneMetaContentMock).toHaveBeenNthCalledWith(1, 'BRAF');
      expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'BRAF', mockUuidReturnValue, true);
    });

    it('should review before deleting cancer type', async () => {
      const store = new FirebaseGeneStore(rootStore);
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review(DEFAULT_USER);
      gene.mutations.push(mutation);
      const tumor = new Tumor();
      tumor.cancerTypes_review = new Review(DEFAULT_USER);
      mutation.tumors.push(tumor);
      store.data = gene;
      await store.deleteSection(NestLevelType.CANCER_TYPE, getFirebasePath('TUMORS', 'BRAF', '0', '0'));

      expect(deleteFromArrayMock).toHaveBeenCalledTimes(0);

      expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
        cancerTypes_review: { removed: true, updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
      });

      expect(updateGeneMetaContentMock).toHaveBeenNthCalledWith(1, 'BRAF');
      expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'BRAF', mockUuidReturnValue, true);
    });

    it('should review before deleting therapy', async () => {
      const store = new FirebaseGeneStore(rootStore);
      const gene = new Gene('BRAF');
      const mutation = new Mutation('V600E');
      mutation.name_review = new Review(DEFAULT_USER);
      gene.mutations.push(mutation);
      const tumor = new Tumor();
      tumor.cancerTypes_review = new Review(DEFAULT_USER);
      mutation.tumors.push(tumor);
      const treatment = new Treatment('Vemurafenib');
      treatment.name_review = new Review(DEFAULT_USER);
      tumor.TIs[0].treatments.push(treatment);
      store.data = gene;
      await store.deleteSection(NestLevelType.THERAPY, getFirebasePath('TREATMENTS', 'BRAF', '0', '0', '0', '0'));

      expect(deleteFromArrayMock).toHaveBeenCalledTimes(0);

      expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
        name_review: { removed: true, updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
      });

      expect(updateGeneMetaContentMock).toHaveBeenNthCalledWith(1, 'BRAF');
      expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'BRAF', mockUuidReturnValue, true);
    });
  });
});
