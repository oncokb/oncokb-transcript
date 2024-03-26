import { action, autorun, makeObservable, observable, runInAction } from 'mobx';
import { CancerType, DX_LEVELS, PX_LEVELS, Review, TX_LEVELS, Tumor } from '../model/firebase/firebase.model';
import _ from 'lodash';

export class RelevantCancerType extends CancerType {
  isDeleted: boolean;
  level: number;
}
export class RelevantCancerTypesModalStore {
  public isOpen = false;
  public tumor: Tumor = null;
  public excludedRCTsReview: Review = null;
  public excludedRCTsUuid: string = null;
  public relevantCancerTypes: RelevantCancerType[] = [];
  public level: TX_LEVELS | DX_LEVELS | PX_LEVELS = null;
  public firebaseExcludedRCTs: CancerType[];

  public pathToRelevantCancerTypes: string = null; // not observable

  constructor() {
    makeObservable(this, {
      isOpen: observable,
      tumor: observable,
      relevantCancerTypes: observable,
      level: observable,
      openModal: action.bound,
      closeModal: action.bound,
      setRelevantCancerTypes: action.bound,
      setDeleted: action.bound,
    });
    autorun(() => {
      if (!this.isSorted(this.relevantCancerTypes)) {
        runInAction(() => {
          this.relevantCancerTypes = this.relevantCancerTypes.slice().sort(this.compareRelevantCancerTypes);
        });
      }
    });
  }

  private compareRelevantCancerTypes(a: RelevantCancerType, b: RelevantCancerType) {
    if (a.isDeleted && !b.isDeleted) {
      return 1;
    }
    if (!a.isDeleted && b.isDeleted) {
      return -1;
    }
    return a.level - b.level;
  }

  private isSorted(rcts: RelevantCancerType[]) {
    for (let i = 1; i < rcts.length; i++) {
      if (this.compareRelevantCancerTypes(rcts[i - 1], rcts[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  openModal(
    pathToRelevantCancerTypes: string,
    tumor: Tumor,
    excludedRCTsReview: Review,
    excludedRCTsUuid: string,
    level?: TX_LEVELS | DX_LEVELS | PX_LEVELS,
    firebaseExcludedRCTs?: CancerType[]
  ) {
    this.pathToRelevantCancerTypes = pathToRelevantCancerTypes;
    this.isOpen = true;
    this.tumor = tumor;
    this.level = level;
    this.firebaseExcludedRCTs = firebaseExcludedRCTs;
    this.excludedRCTsReview = excludedRCTsReview;
    this.excludedRCTsUuid = excludedRCTsUuid;
  }

  closeModal() {
    this.relevantCancerTypes = [];
    this.firebaseExcludedRCTs = [];
    this.pathToRelevantCancerTypes = null;
    this.isOpen = false;
    this.tumor = null;
    this.level = null;
  }

  setRelevantCancerTypes(relevantCancerTypes: RelevantCancerType[]) {
    this.relevantCancerTypes = relevantCancerTypes;
  }

  setDeleted(index: number, isDeleted: boolean) {
    const newRcts = _.cloneDeep(this.relevantCancerTypes);
    newRcts[index].isDeleted = isDeleted;
    this.relevantCancerTypes = newRcts;
  }
}
