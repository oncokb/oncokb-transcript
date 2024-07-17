import { action, autorun, makeObservable, observable, runInAction } from 'mobx';
import { CancerType, DX_LEVELS, PX_LEVELS, Review, TX_LEVELS, Tumor } from '../model/firebase/firebase.model';
import _ from 'lodash';

export class RelevantCancerType extends CancerType {
  isDeleted: boolean | undefined;
  level: number | undefined;
}
export class RelevantCancerTypesModalStore {
  public isOpen = false;
  public tumor: Tumor | null = null;
  public excludedRCTsReview: Review | null = null;
  public excludedRCTsUuid: string | null = null;
  public relevantCancerTypes: RelevantCancerType[] = [];
  public level: TX_LEVELS | DX_LEVELS | PX_LEVELS | null = null;
  public firebaseExcludedRCTs: CancerType[] | undefined;

  public pathToRelevantCancerTypes: string | null = null; // not observable

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
    return (a.level ?? 0) - (b.level ?? 0);
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
    pathToRelevantCancerTypes: string | undefined,
    tumor: Tumor | undefined,
    excludedRCTsReview: Review | undefined,
    excludedRCTsUuid: string | undefined,
    level?: TX_LEVELS | DX_LEVELS | PX_LEVELS,
    firebaseExcludedRCTs?: CancerType[],
  ) {
    this.pathToRelevantCancerTypes = pathToRelevantCancerTypes ?? null;
    this.isOpen = true;
    this.tumor = tumor ?? null;
    this.level = level ?? null;
    this.firebaseExcludedRCTs = firebaseExcludedRCTs;
    this.excludedRCTsReview = excludedRCTsReview ?? null;
    this.excludedRCTsUuid = excludedRCTsUuid ?? null;
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
