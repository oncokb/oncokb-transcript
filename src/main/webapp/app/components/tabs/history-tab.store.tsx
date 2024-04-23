import { action, computed, makeObservable, observable } from 'mobx';
import _ from 'lodash';

export class HistoryTabStore {
  selectedStartDate = '';
  selectedEndDate = '';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  selectedAuthor: { label: string; value: string } = null;

  appliedStartDate = '';
  appliedEndDate = '';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  appliedAuthor: { label: string; value: string } = null;

  constructor() {
    makeObservable(this, {
      selectedAuthor: observable,
      selectedStartDate: observable,
      selectedEndDate: observable,
      appliedAuthor: observable,
      appliedStartDate: observable,
      appliedEndDate: observable,
      setSelectedAuthor: action.bound,
      setSelectedStartDate: action.bound,
      setSelectedEndDate: action.bound,
      applyFilters: action.bound,
      isFiltered: computed,
    });
  }

  setSelectedAuthor(author: { label: string; value: string }) {
    this.selectedAuthor = author;
  }

  setSelectedStartDate(date: string) {
    this.selectedStartDate = date;
  }

  setSelectedEndDate(date: string) {
    this.selectedEndDate = date;
  }

  applyFilters() {
    this.appliedAuthor = this.selectedAuthor;
    this.appliedStartDate = this.selectedStartDate;
    this.appliedEndDate = this.selectedEndDate;
  }

  reset() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.selectedAuthor = null;
    this.selectedStartDate = '';
    this.selectedEndDate = '';

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.appliedAuthor = null;
    this.appliedStartDate = '';
    this.appliedEndDate = '';
  }

  get isFiltered() {
    return this.appliedAuthor || this.appliedStartDate || this.appliedEndDate;
  }
}
