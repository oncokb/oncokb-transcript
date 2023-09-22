const mockUpdate = jest.fn().mockImplementation((db, value) => {});
const mockRemove = jest.fn().mockImplementation((db, value) => {});
const mockRef = jest.fn().mockImplementation(db => {});

import 'jest-expect-message';
import { FirebaseMetaStore } from './firebase.meta.store';
import { generateUuid } from 'app/shared/util/utils';

jest.mock('firebase/database', () => {
  return {
    ref: mockRef,
    update: mockUpdate,
    remove: mockRemove,
  };
});

describe('FirebaseMetaStore', () => {
  let rootStore = undefined;
  const defaultDate = new Date('2023-09-21');

  const reset = () => {
    jest.useFakeTimers().setSystemTime(defaultDate);
    rootStore = { firebaseStore: {}, authStore: { fullName: 'test user' } } as any;
    jest.clearAllMocks();
  };

  describe('updateGeneMetaContent', () => {
    beforeEach(() => reset());

    it('should update lastModifiedBy and lastModifiedAt fields', async () => {
      const store = new FirebaseMetaStore(rootStore);
      await store.updateGeneMetaContent('ABL1');
      expect(mockUpdate).toHaveBeenCalled();

      const updateValueArg = mockUpdate.mock.calls[0][1]; // The second value that is passed to update function
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({ lastModifiedBy: 'test user', lastModifiedAt: defaultDate.getTime().toString() });
    });

    it('should update to the correct location', async () => {
      const store = new FirebaseMetaStore(rootStore);
      await store.updateGeneMetaContent('BRAF');

      expect(mockRef).toHaveBeenCalled();

      const refPathArg = mockRef.mock.calls[0][1];
      expect(refPathArg).toBeDefined();
      expect(refPathArg).toEqual('Meta/BRAF');
    });
  });

  describe('updateGeneReviewUuid', () => {
    beforeEach(() => reset());

    it('should add uuid to gene meta review', async () => {
      const store = new FirebaseMetaStore(rootStore);
      const testUuid = generateUuid();
      await store.updateGeneReviewUuid('EGFR', testUuid, true);

      expect(mockUpdate).toHaveBeenCalled();

      const reviewKey = `review/${testUuid}`;
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({ [reviewKey]: true });

      // Check the path for updated data
      expect(mockRef).toHaveBeenCalledTimes(1);
      const refPathArg = mockRef.mock.calls[0][1];
      expect(refPathArg).toBeDefined();
      expect(refPathArg).toEqual(`Meta/EGFR`);
    });

    it('should remove uuid from gene meta review', async () => {
      const store = new FirebaseMetaStore(rootStore);
      const testUuid = generateUuid();
      await store.updateGeneReviewUuid('FLT3', testUuid, false);

      // Should call the firebase remove() function
      expect(mockRemove).toHaveBeenCalledTimes(1);

      // Check the path for removed data
      expect(mockRef).toHaveBeenCalledTimes(1);
      const refPathArg = mockRef.mock.calls[0][1];
      expect(refPathArg).toBeDefined();
      expect(refPathArg).toEqual(`Meta/FLT3/review/${testUuid}`);
    });
  });

  describe('updateCollaborator', () => {
    let store = undefined;
    const genes = ['ABL1', 'BRAF', 'EGFR'];

    beforeEach(() => {
      reset();
      store = new FirebaseMetaStore(rootStore);
      store.metaCollaborators = { 'test user': genes };
    });

    it('should add gene to collaborator list', async () => {
      expect(store.metaCollaborators).toBeDefined();

      await store.updateCollaborator('APC', true);

      expect(mockUpdate).toHaveBeenCalledTimes(1);

      // Check update value
      const updateValueArg = mockUpdate.mock.calls[0][1];
      expect(updateValueArg).toBeDefined();
      expect(updateValueArg).toEqual({ [genes.length]: 'APC' });

      // Check the path for updated data
      expect(mockRef).toHaveBeenCalledTimes(1);
      const refPathArg = mockRef.mock.calls[0][1];
      expect(refPathArg).toBeDefined();
      expect(refPathArg).toEqual('Meta/collaborators/test user');
    });

    it('should not add duplicate gene to collaborator list', async () => {
      expect(store.metaCollaborators).toBeDefined();

      await store.updateCollaborator('ABL1', true);

      // Should not update to firebase because gene already in list
      expect(mockUpdate).toHaveBeenCalledTimes(0);
    });

    it('should remove gene from collaborator list', async () => {
      expect(store.metaCollaborators).toBeDefined();

      await store.updateCollaborator('ABL1', false);

      expect(mockRemove).toHaveBeenCalledTimes(1);

      // Check the path for removed data
      expect(mockRef).toHaveBeenCalledTimes(1);
      const refPathArg = mockRef.mock.calls[0][1];
      expect(refPathArg).toBeDefined();
      expect(refPathArg).toEqual('Meta/collaborators/test user/0');
    });

    it('should not call remove when gene is not in collaborator list', async () => {
      expect(store.metaCollaborators).toBeDefined();

      await store.updateCollaborator('fake', false);

      expect(mockRemove).toHaveBeenCalledTimes(0);
    });

    it('should throw exception if collaborator name is undefined', async () => {
      rootStore.authStore.fullName = undefined;

      await expect(store.updateCollaborator('ABL1', true)).rejects.toThrow();

      await expect(store.updateCollaborator('ABL1', false)).rejects.toThrow();
    });
  });
});
