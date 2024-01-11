import { action, makeObservable, observable } from 'mobx';
import { DrugSelectOption } from '../select/DrugSelect';

export class ModifyTherapyModalStore {
  public openTreatmentUuid: string = null;
  public selectedTreatments: DrugSelectOption[][] = [];
  public isErrorFetchingTherapies = false;
  public isRetryButtonClicked = false;

  constructor() {
    makeObservable(this, {
      openTreatmentUuid: observable,
      selectedTreatments: observable,
      isErrorFetchingTherapies: observable,
      isRetryButtonClicked: observable,
      openModal: action.bound,
      closeModal: action.bound,
      setSelectedTreatments: action.bound,
      setIsErrorFetchingTherapies: action.bound,
      setIsRetryButtonClicked: action.bound,
      setTherapy: action.bound,
      removeTherapy: action.bound,
    });
  }

  openModal(treatmentUuid: string) {
    this.openTreatmentUuid = treatmentUuid;
  }

  closeModal() {
    this.openTreatmentUuid = null;
    this.selectedTreatments = [];
    this.isErrorFetchingTherapies = false;
    this.isRetryButtonClicked = false;
  }

  setSelectedTreatments(treatments: DrugSelectOption[][]) {
    this.selectedTreatments = treatments;
  }

  setIsErrorFetchingTherapies(isError: boolean) {
    this.isErrorFetchingTherapies = isError;
  }

  setIsRetryButtonClicked(isClicked: boolean) {
    this.isRetryButtonClicked = isClicked;
  }

  setTherapy(index: number, therapy: DrugSelectOption[]) {
    this.selectedTreatments[index] = therapy;
  }

  removeTherapy(index: number) {
    this.selectedTreatments.splice(index, 1);
  }
}
