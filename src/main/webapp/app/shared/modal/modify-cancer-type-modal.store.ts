import { action, makeObservable, observable } from 'mobx';
import { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType, Tumor } from '../model/firebase/firebase.model';
import { getCancerTypeFromCancerTypeSelectOption } from './ModifyCancerTypeModal';
import { getCancerTypesName } from '../util/utils';
import _ from 'lodash';

export class ModifyCancerTypeModalStore {
  public openCancerTypesUuid: string | null = null;
  public includedCancerTypes: readonly CancerTypeSelectOption[] = [];
  public excludedCancerTypes: readonly CancerTypeSelectOption[] = [];
  public isErrorFetchingICancerTypes = false;
  public isErrorIncludedAndExcluded = false;
  public isErrorDuplicate = false;
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

  private setIsErrorIncludedAndExcluded(cancerTypes1: readonly CancerTypeSelectOption[], cancerTypes2: readonly CancerTypeSelectOption[]) {
    for (const ct1 of cancerTypes1) {
      for (const ct2 of cancerTypes2) {
        if (ct1?.value === ct2?.value) {
          this.isErrorIncludedAndExcluded = true;
          return;
        }
      }
    }
    this.isErrorIncludedAndExcluded = false;
  }

  private getSortedCancerTypeName(cancerTypes: CancerType[]) {
    const cancerTypeParts = getCancerTypesName(cancerTypes, true, ',').split(',');
    cancerTypeParts.sort();
    return cancerTypeParts.join(',');
  }

  private setIsErrorDuplicate(
    included: readonly CancerTypeSelectOption[],
    excluded: readonly CancerTypeSelectOption[],
    allCancerTypes: Tumor[],
    cancerTypeToEditUuid?: string,
  ) {
    const includedCancerTypes = included.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeIncluded = this.getSortedCancerTypeName(includedCancerTypes);

    const excludedCancerTypes = excluded.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeExcluded = this.getSortedCancerTypeName(excludedCancerTypes);

    for (const cancerType of allCancerTypes) {
      if (cancerType.cancerTypes_uuid !== cancerTypeToEditUuid) {
        const currentCancerTypeIncluded = this.getSortedCancerTypeName(Object.values(cancerType.cancerTypes));
        const currentCancerTypeExcluded = this.getSortedCancerTypeName(Object.values(cancerType.excludedCancerTypes || {}));

        if (newCancerTypeIncluded === currentCancerTypeIncluded && newCancerTypeExcluded === currentCancerTypeExcluded) {
          this.isErrorDuplicate = true;
          return;
        }
      }
    }
    this.isErrorDuplicate = false;
  }

  setIncludedCancerTypes(cancerTypes: readonly CancerTypeSelectOption[], allCancerTypes: Tumor[], cancerTypeToEditUuid?: string) {
    this.setIsErrorIncludedAndExcluded(cancerTypes, this.excludedCancerTypes);
    this.setIsErrorDuplicate(cancerTypes, this.excludedCancerTypes, allCancerTypes, cancerTypeToEditUuid);
    this.includedCancerTypes = cancerTypes;
  }

  setExcludedCancerTypes(cancerTypes: readonly CancerTypeSelectOption[], allCancerTypes: Tumor[], cancerTypeToEditUuid?: string) {
    this.setIsErrorIncludedAndExcluded(this.includedCancerTypes, cancerTypes);
    this.setIsErrorDuplicate(this.includedCancerTypes, cancerTypes, allCancerTypes, cancerTypeToEditUuid);
    this.excludedCancerTypes = cancerTypes;
  }

  setIsErrorFetchingICancerTypes(isError: boolean) {
    this.isErrorFetchingICancerTypes = isError;
  }

  setIsRetryButtonClicked(isClicked: boolean) {
    this.isRetryButtonClicked = isClicked;
  }

  openModal(cancerTypesUuid: string | null) {
    this.openCancerTypesUuid = cancerTypesUuid;
  }

  closeModal() {
    this.openCancerTypesUuid = null;
    this.includedCancerTypes = [];
    this.excludedCancerTypes = [];
    this.isErrorFetchingICancerTypes = false;
    this.isErrorIncludedAndExcluded = false;
    this.isErrorDuplicate = false;
    this.isRetryButtonClicked = false;
  }
}
