import { action, observable, makeObservable } from 'mobx';

const SIDEBAR_COLLAPSED_WIDTH = 80;
const SIDEBAR_EXPANDED_WIDTH = 200;

export class LayoutStore {
  public isSideBarCollapsed = false;
  public sidebarWidth = SIDEBAR_EXPANDED_WIDTH;
  public showCurationPanel = false;

  constructor() {
    makeObservable(this, {
      isSideBarCollapsed: observable,
      toggleSideBar: action.bound,
      sidebarWidth: observable,
      showCurationPanel: observable,
      toggleCurationPanel: action.bound,
    });
  }

  toggleSideBar() {
    this.isSideBarCollapsed = !this.isSideBarCollapsed;
    this.sidebarWidth = this.isSideBarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  }

  toggleCurationPanel(value: boolean) {
    this.showCurationPanel = value;
  }
}

export default LayoutStore;
