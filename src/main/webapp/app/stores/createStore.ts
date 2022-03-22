import { LoadingBarStore } from 'app/stores/loading-bar.store';
import { AuthStore } from 'app/stores/authentication.store';
import { SettingsStore } from 'app/pages/account/settings.store';
import { History } from 'history';
import { RouterStore } from './router.store';
import NavigationControlStore from './navigation-control.store';
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly settingsStore: SettingsStore;
  readonly routerStore: RouterStore;
  readonly navigationControlStore: NavigationControlStore;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  rootStore.navigationControlStore = new NavigationControlStore();
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
