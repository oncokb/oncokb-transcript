import { FirebaseDuplicateGeneCreationError, FirebaseGeneService } from './firebase-gene-service';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { AuthStore } from 'app/stores';
import GeneStore from 'app/entities/gene/gene.store';
import { FirebaseDataStore } from 'app/stores/firebase/firebase-data.store';
import { MutationList } from 'app/shared/model/firebase/firebase.model';
import { FirebaseMetaService } from './firebase-meta-service';
import { FirebaseGeneReviewService } from './firebase-gene-review-service';
import { mock, mockReset } from 'jest-mock-extended';

describe('Firebase Gene Service', () => {
  const mockFirebaseRepository = mock<FirebaseRepository>();
  const mockAuthStore = mock<AuthStore>();
  const mockGeneStore = mock<GeneStore>();
  const mockFirebaseMutationListStore = mock<FirebaseDataStore<MutationList>>();
  const mockFirebaseMutationConvertIconStore = mock<FirebaseDataStore<MutationList>>();
  const mockFirebaseMetaService = mock<FirebaseMetaService>();
  const mockFirebaseGeneReviewService = mock<FirebaseGeneReviewService>();
  let firebaseGeneService: FirebaseGeneService;

  beforeEach(() => {
    mockReset(mockFirebaseRepository);
    mockReset(mockAuthStore);
    mockReset(mockGeneStore);
    mockReset(mockFirebaseMutationListStore);
    mockReset(mockFirebaseMutationConvertIconStore);
    mockReset(mockFirebaseMetaService);
    mockReset(mockFirebaseGeneReviewService);

    firebaseGeneService = new FirebaseGeneService(
      mockFirebaseRepository,
      mockAuthStore,
      mockGeneStore,
      mockFirebaseMutationListStore,
      mockFirebaseMutationConvertIconStore,
      mockFirebaseMetaService,
      mockFirebaseGeneReviewService,
    );
  });

  describe('createGene', () => {
    it('creates gene and meta when both paths are absent', async () => {
      mockFirebaseRepository.createIfAbsent.mockResolvedValue({ committed: true } as any);
      mockFirebaseMetaService.createMetaGene.mockResolvedValue({ committed: true } as any);

      await firebaseGeneService.createGene('BRAF', false);

      expect(mockFirebaseRepository.createIfAbsent).toHaveBeenCalledWith('Genes/BRAF', expect.objectContaining({ name: 'BRAF' }));
      expect(mockFirebaseMetaService.createMetaGene).toHaveBeenCalledWith('BRAF', false);
      expect(mockFirebaseRepository.delete).not.toHaveBeenCalled();
    });

    it('blocks creation when the gene already exists', async () => {
      mockFirebaseRepository.createIfAbsent.mockResolvedValue({ committed: false } as any);

      await expect(firebaseGeneService.createGene('BRAF', false)).rejects.toThrow(FirebaseDuplicateGeneCreationError);

      expect(mockFirebaseMetaService.createMetaGene).not.toHaveBeenCalled();
      expect(mockFirebaseRepository.delete).not.toHaveBeenCalled();
    });

    it('rolls back the new gene shell when meta already exists', async () => {
      mockFirebaseRepository.createIfAbsent.mockResolvedValue({ committed: true } as any);
      mockFirebaseMetaService.createMetaGene.mockResolvedValue({ committed: false } as any);

      await expect(firebaseGeneService.createGene('BRAF', false)).rejects.toThrow(FirebaseDuplicateGeneCreationError);

      expect(mockFirebaseRepository.delete).toHaveBeenCalledWith('Genes/BRAF');
    });

    it('rolls back the new gene shell when meta creation fails', async () => {
      mockFirebaseRepository.createIfAbsent.mockResolvedValue({ committed: true } as any);
      mockFirebaseMetaService.createMetaGene.mockRejectedValue(new Error('meta failed'));

      await expect(firebaseGeneService.createGene('BRAF', false)).rejects.toThrow('meta failed');

      expect(mockFirebaseRepository.delete).toHaveBeenCalledWith('Genes/BRAF');
    });
  });
});
