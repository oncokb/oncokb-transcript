import { LoadingBarStore } from 'app/shared/stores/loading-bar.store';
import { AuthStore } from 'app/shared/stores/authentication.store';
import { ApplicationProfileStore } from 'app/shared/stores/application-profile.store';
import { SettingsStore } from 'app/modules/account/settings/settings.store';
import { History } from 'history';
import { RouterStore } from './router.store';
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly profileStore: ApplicationProfileStore;
  readonly settingsStore: SettingsStore;
  readonly routerStore: RouterStore;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.profileStore = new ApplicationProfileStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
