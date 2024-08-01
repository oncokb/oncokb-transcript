import { action, makeObservable, observable } from 'mobx';
import { DrugSelectOption } from '../select/DrugSelect';

export class ModifyTherapyModalStore {
  public openTreatmentUuid: string | null = null;
  public selectedTreatments: DrugSelectOption[][] = [];

  constructor() {
    makeObservable(this, {
      openTreatmentUuid: observable,
      selectedTreatments: observable,
      openModal: action.bound,
      closeModal: action.bound,
      setSelectedTreatments: action.bound,
      addTherapy: action.bound,
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
  }

  setSelectedTreatments(treatments: DrugSelectOption[][]) {
    this.selectedTreatments = treatments;
  }

  addTherapy() {
    this.selectedTreatments.push([]);
  }

  setTherapy(index: number, therapy: DrugSelectOption[]) {
    this.selectedTreatments[index] = therapy;
  }

  removeTherapy(index: number) {
    this.selectedTreatments.splice(index, 1);
  }
}
