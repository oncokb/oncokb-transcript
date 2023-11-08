import { action, observable, makeObservable, computed } from 'mobx';
import { IRootStore } from './createStore';

const SPACE_BETWEEN = 15;

export const SIDEBAR_COLLAPSED_WIDTH = 75;
export const SIDEBAR_EXPANDED_WIDTH = 200;
const CURATION_PANEL_WIDTH = 350;

export class LayoutStore {
  public isNavigationSidebarCollapsed = false;
  public navigationSidebarWidth = SIDEBAR_EXPANDED_WIDTH;
  public showCurationPanel = false;
  public curationPanelWidth = CURATION_PANEL_WIDTH;

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      isNavigationSidebarCollapsed: observable,
      toggleNavigationSidebar: action.bound,
      navigationSidebarWidth: observable,
      centerContentMargin: computed,
      showCurationPanel: observable,
      toggleCurationPanel: action.bound,
      curationPanelWidth: observable,
    });
  }

  toggleNavigationSidebar() {
    this.isNavigationSidebarCollapsed = !this.isNavigationSidebarCollapsed;
    this.navigationSidebarWidth = this.isNavigationSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  }

  get centerContentMargin() {
    const rightMargin = this.showCurationPanel ? this.curationPanelWidth + SPACE_BETWEEN : 0;
    const leftMargin = this.rootStore.authStore.isAuthorized ? this.navigationSidebarWidth + SPACE_BETWEEN : 0;
    return `0 ${rightMargin}px 0 ${leftMargin}px`;
  }

  toggleCurationPanel(value: boolean) {
    this.showCurationPanel = value;
  }
}

export default LayoutStore;
