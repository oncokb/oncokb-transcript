import { action, observable, makeObservable } from 'mobx';

export class NavigationControlStore {
  public isSideBarCollapsed = false;

  constructor() {
    makeObservable(this, {
      isSideBarCollapsed: observable,
      toggleSideBar: action.bound,
    });
  }

  toggleSideBar() {
    this.isSideBarCollapsed = !this.isSideBarCollapsed;
  }
}

export default NavigationControlStore;
