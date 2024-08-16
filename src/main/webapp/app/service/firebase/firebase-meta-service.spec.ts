import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { AuthStore } from 'app/stores';
import { FirebaseMetaService } from './firebase-meta-service';
import { mock, mockReset } from 'jest-mock-extended';
import { getTumorNameUuid } from 'app/shared/util/firebase/firebase-review-utils';
import _ from 'lodash';
import { generateUuid } from 'app/shared/util/utils';

describe('Firebase Meta Service', () => {
  const DEFAULT_DATE = new Date('2023-01-01');
  const DEFAULT_UUID = generateUuid();
  const mockFirebaseRepository = mock<FirebaseRepository>();
  const mockAuthStore = mock<AuthStore>();
  let firebaseMetaService: FirebaseMetaService;

  beforeEach(() => {
    mockReset(mockFirebaseRepository);
    mockReset(mockAuthStore);
    firebaseMetaService = new FirebaseMetaService(mockFirebaseRepository, mockAuthStore);
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
  });

  describe('updateGeneReviewUuid', () => {
    it('should update meta collection with uuid', async () => {
      await firebaseMetaService.updateGeneReviewUuid('BRAF', DEFAULT_UUID, true, false);
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('/', {
        [`Meta/BRAF/review/${DEFAULT_UUID}`]: true,
      });
    });

    it('should update meta collection with comma seperated uuids', async () => {
      const cancerTypesUuid = generateUuid();
      const excludedCancerTypesUuid = generateUuid();
      await firebaseMetaService.updateGeneReviewUuid('BRAF', getTumorNameUuid(cancerTypesUuid, excludedCancerTypesUuid), true, false);
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('/', {
        [`Meta/BRAF/review/${cancerTypesUuid}, ${excludedCancerTypesUuid}`]: true,
      });
    });

    it('should remove uuid from meta collection', async () => {
      await firebaseMetaService.updateGeneReviewUuid('BRAF', DEFAULT_UUID, false, false);
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('/', {
        [`Meta/BRAF/review/${DEFAULT_UUID}`]: null,
      });
    });

    it('should remove all uuids in comma seperated list from meta collection', async () => {
      const cancerTypesUuid = generateUuid();
      const excludedCancerTypesUuid = generateUuid();
      await firebaseMetaService.updateGeneReviewUuid('BRAF', getTumorNameUuid(cancerTypesUuid, excludedCancerTypesUuid), false, false);
      // The uuid of a tumor name change consists of two uuids that are comma seperated. They should
      // should be cleared individually and together.
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('/', {
        [`Meta/BRAF/review/${cancerTypesUuid}, ${excludedCancerTypesUuid}`]: null,
        [`Meta/BRAF/review/${cancerTypesUuid}`]: null,
        [`Meta/BRAF/review/${excludedCancerTypesUuid}`]: null,
      });
    });
  });
});
