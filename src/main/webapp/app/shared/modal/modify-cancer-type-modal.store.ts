import { action, makeObservable, observable } from 'mobx';
import { CancerTypeSelectOption } from '../select/CancerTypeSelect';
import { CancerType, Tumor } from '../model/firebase/firebase.model';
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

  private getSortedCancerTypeName(cancerTypes: CancerType[]) {
    const cancerTypeParts = getCancerTypesName(cancerTypes, true, ',').split(',');
    cancerTypeParts.sort();
    return cancerTypeParts.join(',');
  }

  private setIsErrorDuplicate(
    included: CancerTypeSelectOption[],
    excluded: CancerTypeSelectOption[],
    allCancerTypes: Tumor[],
    cancerTypeToEditUuid?: string,
  ) {
    const includedCancerTypes = included.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeIncluded = this.getSortedCancerTypeName(includedCancerTypes);

    const excludedCancerTypes = excluded.map(option => getCancerTypeFromCancerTypeSelectOption(option));
    const newCancerTypeExcluded = this.getSortedCancerTypeName(excludedCancerTypes);

    for (const cancerType of allCancerTypes) {
      if (cancerType.cancerTypes_uuid !== cancerTypeToEditUuid) {
        const currentCancerTypeIncluded = this.getSortedCancerTypeName(cancerType.cancerTypes);
        const currentCancerTypeExcluded = this.getSortedCancerTypeName(cancerType.excludedCancerTypes || []);

        if (newCancerTypeIncluded === currentCancerTypeIncluded && newCancerTypeExcluded === currentCancerTypeExcluded) {
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
    this.includedCancerTypes = cancerTypes.map(removeCancerTypeCode);
  }

  setExcludedCancerTypes(cancerTypes: CancerTypeSelectOption[], allCancerTypes: Tumor[], cancerTypeToEditUuid?: string) {
    this.setIsErrorIncludedAndExcluded(this.includedCancerTypes, cancerTypes);
    this.setIsErrorDuplicate(this.includedCancerTypes, cancerTypes, allCancerTypes, cancerTypeToEditUuid);
    this.excludedCancerTypes = cancerTypes.map(removeCancerTypeCode);
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

// Once https://github.com/oncokb/oncokb-pipeline/issues/413 is fixed, we can remove this function.
// Then we should complete this ticket: https://github.com/oncokb/oncokb-pipeline/issues/494 to backfill
// all place where code == "" in firebase.
const removeCancerTypeCode = (cancerTypeOption: CancerTypeSelectOption) => {
  if (cancerTypeOption.level < 0) {
    cancerTypeOption.code = null;
  }
  return cancerTypeOption;
};
