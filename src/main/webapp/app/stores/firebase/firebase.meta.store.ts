import { Meta, MetaCollaborators, MetaCollection } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { action, makeObservable, observable } from 'mobx';
import { onValue, ref } from 'firebase/database';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { FB_COLLECTION } from 'app/config/constants/firebase';

export class FirebaseMetaStore extends FirebaseCrudStore<Meta> {
  public metaList: MetaCollection = undefined;
  public metaCollaborators: MetaCollaborators = undefined;

  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      metaList: observable,
      metaCollaborators: observable,
      addMetaListListener: action.bound,
      addMetaCollaboratorsListener: action.bound,
      updateGeneMetaContent: action.bound,
      updateGeneReviewUuid: action.bound,
      updateCollaborator: action.bound,
    });
  }

  /**
   * Create a listener for the entire Meta collection.
   */
  addMetaListListener() {
    const unsubscribe = onValue(
      ref(this.db, FB_COLLECTION.META),
      action(snapshot => {
        this.metaList = snapshot.val();
      }),
      e => {
        /* eslint-disable no-console */
        console.log('addMetaListListener', 'cancelled', e);
      }
    );
    return unsubscribe;
  }

  /**
   * Create a listener for Meta collaborators list
   */
  addMetaCollaboratorsListener() {
    const unsubscribe = onValue(
      ref(this.db, getFirebasePath('META_COLLABORATORS')),
      action(snapshot => {
        this.metaCollaborators = snapshot.val();
      })
    );
    return unsubscribe;
  }

  /**
   * Update the timestamp and author of the most recent edit to the gene.
   * @param hugoSymbol The gene to update the meta information
   */
  updateGeneMetaContent(hugoSymbol: string) {
    // Update timestamp and author
    return this.update(getFirebasePath('META_GENE', hugoSymbol), {
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
      return this.update(getFirebasePath('META_GENE', hugoSymbol), { review: { [uuid]: true } });
    }
    return this.delete(getFirebasePath('META_GENE_REVIEW', hugoSymbol, uuid));
  }

  /**
   * Add user into collaborators list, so that when another user enters review mode, a warning message can be show.
   * @param hugoSymbol The gene that the user is currently working on
   * @param add If gene should be added or removed.
   */
  updateCollaborator(hugoSymbol: string, add: boolean) {
    const name = this.rootStore?.authStore?.fullName?.toLowerCase();
    if (!name) {
      return Promise.reject(new Error('Cannot update collaborator with undefined name'));
    }

    const collaboratorGeneList: string[] = this.metaCollaborators[name] || [];
    if (add && !collaboratorGeneList.includes(hugoSymbol)) {
      return this.update(getFirebasePath('META_COLLABORATOR', name), {
        [collaboratorGeneList.length]: hugoSymbol,
      });
    }

    const index = collaboratorGeneList.findIndex(g => g === hugoSymbol);
    if (!add && index > -1) {
      return this.deleteFromArray(getFirebasePath('META_COLLABORATOR', name), [index]);
    }

    return Promise.resolve();
  }
}
