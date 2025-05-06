import { action, observable, makeObservable, computed } from 'mobx';
import { IRootStore } from './createStore';

const SPACE_BETWEEN = 15;

export const SIDEBAR_COLLAPSED_WIDTH = 75;
export const SIDEBAR_EXPANDED_WIDTH = 200;
export const ONCOKB_SIDEBAR_MIN_WIDTH = 350;
export const ONCOKB_SIDEBAR_MAX_WIDTH_RATIO = 0.5;

export const BANNER_HEIGHT = 42;

export class LayoutStore {
  public isNavigationSidebarCollapsed = false;
  public navigationSidebarWidth = SIDEBAR_EXPANDED_WIDTH;
  public showOncoKBSidebar = false;
  public oncoKBSidebarWidth = ONCOKB_SIDEBAR_MIN_WIDTH;

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      isNavigationSidebarCollapsed: observable,
      toggleNavigationSidebar: action.bound,
      closeNavigationSidebar: action.bound,
      navigationSidebarWidth: observable,
      centerContentMargin: computed,
      showOncoKBSidebar: observable,
      toggleOncoKBSidebar: action.bound,
      oncoKBSidebarWidth: observable,
      setOncoKBSidebarWidth: action.bound,
      oncoKBSidebarMarginTop: computed,
      sidebarHeight: computed,
    });
  }

  toggleNavigationSidebar() {
    this.isNavigationSidebarCollapsed = !this.isNavigationSidebarCollapsed;
    this.navigationSidebarWidth = this.isNavigationSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  }

  closeNavigationSidebar() {
    this.isNavigationSidebarCollapsed = true;
    this.navigationSidebarWidth = SIDEBAR_COLLAPSED_WIDTH;
  }

  get centerContentMargin() {
    const rightMargin = this.showOncoKBSidebar ? this.oncoKBSidebarWidth + SPACE_BETWEEN : 0;
    const leftMargin = this.rootStore.authStore.isAuthorized ? this.navigationSidebarWidth + SPACE_BETWEEN : 0;
    return `0 ${rightMargin}px 0 ${leftMargin}px`;
  }

  toggleOncoKBSidebar(value: boolean) {
    this.showOncoKBSidebar = value;
  }

  setOncoKBSidebarWidth(value: number) {
    this.oncoKBSidebarWidth = value;
  }

  get oncoKBSidebarMarginTop() {
    return this.rootStore.windowStore.isBeta ? `${BANNER_HEIGHT}px` : '0px';
  }

  get sidebarHeight() {
    return `calc(100vh - ${this.oncoKBSidebarMarginTop})`;
  }
}

export default LayoutStore;
