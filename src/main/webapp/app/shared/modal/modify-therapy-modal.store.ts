import { action, makeObservable, observable } from 'mobx';
import { DrugSelectOption } from '../select/DrugSelect';

export class ModifyTherapyModalStore {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public openTreatmentUuid: string = null;
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
