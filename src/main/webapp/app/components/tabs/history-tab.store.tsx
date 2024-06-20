import { action, computed, makeObservable, observable } from 'mobx';
import _ from 'lodash';

export class HistoryTabStore {
  selectedStartDate = '';
  selectedEndDate = '';
  selectedAuthor: { label: string; value: string } | null = null;

  appliedStartDate = '';
  appliedEndDate = '';
  appliedAuthor: { label: string; value: string } | null = null;

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

  setSelectedAuthor(author: { label: string; value: string } | null) {
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
    this.selectedAuthor = null;
    this.selectedStartDate = '';
    this.selectedEndDate = '';

    this.appliedAuthor = null;
    this.appliedStartDate = '';
    this.appliedEndDate = '';
  }

  get isFiltered() {
    return this.appliedAuthor || this.appliedStartDate || this.appliedEndDate;
  }
}
