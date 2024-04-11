import { getFirebaseMetaGenePath, getFirebaseMetaGeneReviewPath, getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import AuthStore from '../../stores/authentication.store';
import { FirebaseRepository } from '../../stores/firebase/firebase-repository';
import { Meta } from 'app/shared/model/firebase/firebase.model';

export class FirebaseMetaService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;

  constructor(firebaseRepository: FirebaseRepository, authStore: AuthStore) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
  }

  /**
   * Update the timestamp and author of the most recent edit to the gene.
   * @param hugoSymbol The gene to update the meta information
   */
  updateGeneMetaContent = (hugoSymbol: string, isGermline: boolean) => {
    // Update timestamp and author
    return this.firebaseRepository.update(getFirebaseMetaGenePath(isGermline, hugoSymbol), {
      lastModifiedBy: this.authStore.fullName,
      lastModifiedAt: new Date().getTime().toString(),
    });
  };

  /**
   * Add the UUID of the field that was updated. Or remove the UUID fo the field that
   * was approved in review mode or reverted back to original value.
   * @param hugoSymbol The gene to update the meta information
   * @param uuid The uuid of the field that was updated
   * @param add Whether the field should be reviewed or removed from review view
   */
  updateGeneReviewUuid = (hugoSymbol: string, uuid: string, add: boolean, isGermline: boolean) => {
    if (add) {
      return this.firebaseRepository.update(`${getFirebaseMetaGenePath(isGermline, hugoSymbol)}/review`, { [uuid]: true });
    }
    return this.firebaseRepository.delete(getFirebaseMetaGeneReviewPath(isGermline, hugoSymbol, uuid));
  };

  /**
   * Add user into collaborators list, so that when another user enters review mode, a warning message can be show.
   * @param hugoSymbol The gene that the user is currently working on
   * @param add If gene should be added or removed.
   */
  updateCollaborator = (hugoSymbol: string, add: boolean, collaboratorGeneList: string[]) => {
    const name = this.authStore.fullName?.toLowerCase();
    if (!name) {
      return Promise.reject(new Error('Cannot update collaborator with undefined name'));
    }

    if (add && !collaboratorGeneList.includes(hugoSymbol)) {
      return this.firebaseRepository.update(getFirebasePath('META_COLLABORATOR', name), {
        [collaboratorGeneList.length]: hugoSymbol,
      });
    }

    const index = collaboratorGeneList.findIndex(g => g === hugoSymbol);
    if (!add && index > -1) {
      return this.firebaseRepository.deleteFromArray(getFirebasePath('META_COLLABORATOR', name), [index]);
    }

    return Promise.resolve();
  };

  updateGeneCurrentReviewer = async (hugoSymbol: string, isGermline: boolean, isReviewing: boolean) => {
    await this.firebaseRepository.update(`${getFirebaseMetaGenePath(isGermline, hugoSymbol)}/review`, {
      currentReviewer: isReviewing ? '' : this.authStore.fullName,
    });
  };

  createMetaGene = async (hugoSymbol: string, isGermline: boolean) => {
    await this.firebaseRepository.create(getFirebaseMetaGenePath(isGermline, hugoSymbol), new Meta());
  };

  deleteMetaGene = async (hugoSymbol: string, isGermline: boolean) => {
    await this.firebaseRepository.delete(getFirebaseMetaGenePath(isGermline, hugoSymbol));
  };
}
