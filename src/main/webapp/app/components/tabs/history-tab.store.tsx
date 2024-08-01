import { action, computed, makeObservable, observable } from 'mobx';
import _ from 'lodash';

export class HistoryTabStore {
  selectedStartDate = '';
  selectedEndDate = '';
  selectedAuthor: { label: string; value: string } | null = null;
  selectedMutation: { label: string; value: string } | null = null;

  appliedStartDate = '';
  appliedEndDate = '';
  appliedAuthor: { label: string; value: string } | null = null;
  appliedMutation: { label: string; value: string } | null = null;

  constructor() {
    makeObservable(this, {
      selectedAuthor: observable,
      selectedMutation: observable,
      selectedStartDate: observable,
      selectedEndDate: observable,
      appliedAuthor: observable,
      appliedMutation: observable,
      appliedStartDate: observable,
      appliedEndDate: observable,
      setSelectedAuthor: action.bound,
      setSelectedMutation: action.bound,
      setSelectedStartDate: action.bound,
      setSelectedEndDate: action.bound,
      applyFilters: action.bound,
      isFiltered: computed,
    });
  }

  setSelectedAuthor(author: { label: string; value: string } | null) {
    this.selectedAuthor = author;
  }

  setSelectedMutation(mutation: { label: string; value: string } | null) {
    this.selectedMutation = mutation;
  }

  setSelectedStartDate(date: string) {
    this.selectedStartDate = date;
  }

  setSelectedEndDate(date: string) {
    this.selectedEndDate = date;
  }

  applyFilters() {
    this.appliedAuthor = this.selectedAuthor;
    this.appliedMutation = this.selectedMutation;
    this.appliedStartDate = this.selectedStartDate;
    this.appliedEndDate = this.selectedEndDate;
  }

  reset() {
    this.selectedAuthor = null;
    this.selectedMutation = null;
    this.selectedStartDate = '';
    this.selectedEndDate = '';

    this.appliedAuthor = null;
    this.appliedMutation = null;
    this.appliedStartDate = '';
    this.appliedEndDate = '';
  }

  get isFiltered() {
    return this.appliedAuthor || this.appliedMutation || this.appliedStartDate || this.appliedEndDate;
  }
}
