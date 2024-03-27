import { action, makeObservable, observable } from 'mobx';
import { CancerTypeSelectOption } from '../select/CancerTypeSelect';

export class ModifyCancerTypeModalStore {
  public openCancerTypesUuid: string = null;
  public includedCancerTypes: CancerTypeSelectOption[] = [];
  public excludedCancerTypes: CancerTypeSelectOption[] = [];
  public isErrorFetchingICancerTypes = false;
  public isErrorIncludedAndExcluded = false;
  public isRetryButtonClicked = false;

  constructor() {
    makeObservable(this, {
      openCancerTypesUuid: observable,
      includedCancerTypes: observable,
      excludedCancerTypes: observable,
      isErrorFetchingICancerTypes: observable,
      isErrorIncludedAndExcluded: observable,
      isRetryButtonClicked: observable,
      setIncludedCancerTypes: action.bound,
      setExcludedCancerTypes: action.bound,
      setIsErrorFetchingICancerTypes: action.bound,
      setIsRetryButtonClicked: action.bound,
      openModal: action.bound,
      closeModal: action.bound,
    });
  }

  private setIsErrorIncludedAndExcluded(cancerTypes1: CancerTypeSelectOption[], cancerTypes2: CancerTypeSelectOption[]) {
    for (const ct1 of cancerTypes1) {
      for (const ct2 of cancerTypes2) {
        if (ct1.value === ct2.value) {
          this.isErrorIncludedAndExcluded = true;
          return;
        }
      }
    }
    this.isErrorIncludedAndExcluded = false;
  }

  setIncludedCancerTypes(cancerTypes: CancerTypeSelectOption[]) {
    this.setIsErrorIncludedAndExcluded(cancerTypes, this.excludedCancerTypes);
    this.includedCancerTypes = cancerTypes;
  }

  setExcludedCancerTypes(cancerTypes: CancerTypeSelectOption[]) {
    this.setIsErrorIncludedAndExcluded(this.includedCancerTypes, cancerTypes);
    this.excludedCancerTypes = cancerTypes;
  }

  setIsErrorFetchingICancerTypes(isError: boolean) {
    this.isErrorFetchingICancerTypes = isError;
  }

  setIsRetryButtonClicked(isClicked: boolean) {
    this.isRetryButtonClicked = isClicked;
  }

  openModal(cancerTypesUuid) {
    this.openCancerTypesUuid = cancerTypesUuid;
  }

  closeModal() {
    this.openCancerTypesUuid = null;
    this.includedCancerTypes = [];
    this.excludedCancerTypes = [];
    this.isErrorFetchingICancerTypes = false;
    this.isRetryButtonClicked = false;
  }
}
