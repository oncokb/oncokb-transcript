import { action, makeObservable, observable } from 'mobx';
import { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { Tumor } from '../model/firebase/firebase.model';
import { getCancerTypeFromCancerTypeSelectOption } from './ModifyCancerTypeModal';
import { getCancerTypesName } from '../util/utils';
import _ from 'lodash';

export class ModifyCancerTypeModalStore {
  public openCancerTypesUuid: string = null;
  public includedCancerTypes: CancerTypeSelectOption[] = [];
  public excludedCancerTypes: CancerTypeSelectOption[] = [];
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

  private setIsErrorDuplicate(
    included: CancerTypeSelectOption[],
    excluded: CancerTypeSelectOption[],
    allCancerTypes: Tumor[],
    cancerTypeToEditUuid?: string,
  ) {
    const includedCancerTypes = included.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeIncludedParts = getCancerTypesName(includedCancerTypes, true, ',').split(',');
    newCancerTypeIncludedParts.sort();
    const newCancerTypeIncluded = newCancerTypeIncludedParts.join(',');

    const excludedCancerTypes = excluded.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeExcludedParts = getCancerTypesName(excludedCancerTypes, true, ',').split(',');
    newCancerTypeExcludedParts.sort();
    const newCancerTypeExcluded = newCancerTypeExcludedParts.join(',');

    for (const cancerType of allCancerTypes) {
      if (cancerType.cancerTypes_uuid !== cancerTypeToEditUuid) {
        const currentCancerTypeIncludedParts = getCancerTypesName(cancerType.cancerTypes, true, ',').split(',');
        currentCancerTypeIncludedParts.sort();

        const currentCancerTypeExcludedParts = getCancerTypesName(cancerType.excludedCancerTypes || [], true, ',').split(',');
        currentCancerTypeExcludedParts.sort();

        if (
          newCancerTypeIncluded === currentCancerTypeIncludedParts.join(',') &&
          newCancerTypeExcluded === currentCancerTypeExcludedParts.join(',')
        ) {
          this.isErrorDuplicate = true;
          return;
        }
      }
    }
    this.isErrorDuplicate = false;
  }

  setIncludedCancerTypes(cancerTypes: CancerTypeSelectOption[], allCancerTypes: Tumor[], cancerTypeToEditUuid?: string) {
    this.setIsErrorIncludedAndExcluded(cancerTypes, this.excludedCancerTypes);
    this.setIsErrorDuplicate(cancerTypes, this.excludedCancerTypes, allCancerTypes, cancerTypeToEditUuid);
    this.includedCancerTypes = cancerTypes;
  }

  setExcludedCancerTypes(cancerTypes: CancerTypeSelectOption[], allCancerTypes: Tumor[], cancerTypeToEditUuid?: string) {
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

  openModal(cancerTypesUuid) {
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
