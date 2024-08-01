import { action, computed, makeObservable, observable } from 'mobx';

export class WindowStore {
  constructor() {
    makeObservable(this, {
      isBeta: computed,
    });
  }

  get isBeta() {
    return window.location.hostname.includes('beta');
  }
}
