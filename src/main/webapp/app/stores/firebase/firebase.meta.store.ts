import { Meta } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase-crud-store';
import { IRootStore } from '../createStore';
import { action, makeObservable } from 'mobx';

export class FirebaseMetaStore extends FirebaseCrudStore<Meta> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateGeneMetaContent: action.bound,
      updateGeneReviewUuid: action.bound,
      updateCollaborator: action.bound,
    });
  }

  /**
   * Update the timestamp and author of the most recent edit to the gene.
   * @param hugoSymbol The gene to update the meta information
   */
  updateGeneMetaContent(hugoSymbol: string) {
    // Update timestamp and author
    this.update(`Meta/${hugoSymbol}`, {
      lastModifiedBy: this.rootStore.authStore.fullName,
      lastModifiedAt: new Date().getTime().toString(),
    });
  }

  /**
   * Add the UUID of the field that was updated. Or remove the UUID fo the field that
   * was approved in review mode or reverted back to original value.
   * @param hugoSymbol The gene to update the meta information
   * @param uuid The uuid of the field that was updated
   * @param add Whether the field should be reviewed or removed from review view
   */
  updateGeneReviewUuid(hugoSymbol: string, uuid: string, add: boolean) {
    if (add) {
      this.update(`Meta/${hugoSymbol}`, { review: { [uuid]: true } });
    } else {
      this.delete(`Meta/${hugoSymbol}/review/${uuid}`);
    }
  }

  /**
   * Add user into collaborators list, so that when another user enters review mode, a warning message can be show.
   * @param hugoSymbol The gene that the user is currently working on
   * @param add If gene should be added or removed.
   */
  updateCollaborator(hugoSymbol: string, add: boolean) {
    const name = this.rootStore.authStore.fullName.toLowerCase();
    const collaboratorGeneList: string[] = this.data[name];
    if (add && !this.data[name].includes(hugoSymbol)) {
      this.update(`Meta/collaborators/${name}`, { [collaboratorGeneList.length]: hugoSymbol });
    } else if (!add) {
      const index = collaboratorGeneList.findIndex(g => g === hugoSymbol);
      this.delete(`Meta/collaborators/${name}/${index}`);
    }
  }
}
