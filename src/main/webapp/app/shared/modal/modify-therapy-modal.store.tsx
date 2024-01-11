import { action, makeObservable, observable } from 'mobx';
import { DrugSelectOption } from '../select/DrugSelect';

export class ModifyTherapyModalStore {
  public openTreatmentUuid: string = null;
  public selectedTreatments: DrugSelectOption[][] = [];
  public isErrorFetchingTherapies = false;

  constructor() {
    makeObservable(this, {
      openTreatmentUuid: observable,
      selectedTreatments: observable,
      isErrorFetchingTherapies: observable,
      openModal: action.bound,
      setSelectedTreatments: action.bound,
      setIsErrorFetchingTherapies: action.bound,
    });
  }

  openModal(treatmentUuid: string) {
    this.openTreatmentUuid = treatmentUuid;
  }

  setSelectedTreatments(treatments: DrugSelectOption[][]) {
    this.selectedTreatments = treatments;
  }

  setIsErrorFetchingTherapies(isError: boolean) {
    this.isErrorFetchingTherapies = isError;
  }
}
