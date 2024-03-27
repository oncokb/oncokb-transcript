import { action, computed, makeObservable, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores/createStore';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signOut } from 'firebase/auth';
import { AppConfig } from 'app/appConfig';

export class FirebaseStore extends BaseStore {
  public firebaseEnabled = false;
  public firebaseOptions: FirebaseOptions | undefined = undefined;
  public firebaseApp: FirebaseApp | undefined = undefined;
  public firebaseDb: Database | undefined = undefined;
  public firebaseCustomToken = '';
  public firebaseInitSuccess = false;
  public firebaseInitError: Error | undefined = undefined;
  public firebaseLoginSuccess = false;
  public firebaseLoginError: Error | undefined = undefined;

  getFirebaseToken = this.readHandler(this.getFirebaseTokenGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      firebaseEnabled: observable,
      firebaseOptions: observable,
      firebaseApp: observable,
      firebaseDb: observable,
      firebaseInitSuccess: observable,
      firebaseInitError: observable,
      firebaseLoginSuccess: observable,
      firebaseLoginError: observable,
      firebaseReady: computed,
      initializeFirebase: action.bound,
      signInToFirebase: action.bound,
      signOutFromFirebase: action.bound,
      getFirebaseToken: action.bound,
    });
  }

  get firebaseReady() {
    return this.firebaseInitSuccess && this.firebaseLoginSuccess;
  }

  *getFirebaseTokenGen() {
    const result: AxiosResponse = yield axios.get('/api/account/firebase-token');
    this.firebaseCustomToken = result.data;
    return result.data;
  }

  initializeFirebase() {
    const { enabled, ...firebaseOptions } = AppConfig.serverConfig.frontend.firebase;
    this.firebaseEnabled = enabled;
    if (this.firebaseEnabled) {
      try {
        this.firebaseOptions = firebaseOptions as FirebaseOptions;
        this.firebaseApp = initializeApp(this.firebaseOptions);
        this.firebaseDb = getDatabase(this.firebaseApp);
        const auth = getAuth();
        this.firebaseInitSuccess = true;
        return onAuthStateChanged(auth, user => {
          if (!user) {
            this.firebaseLoginSuccess = false;
            this.signInToFirebase();
          } else {
            this.firebaseLoginSuccess = true;
          }
        });
      } catch (error) {
        this.firebaseInitError = error;
        notifyError(error, 'Encountered issue initializing Firebase app.');
        this.firebaseInitSuccess = false;
      }
    }
  }

  signInToFirebase() {
    this.getFirebaseToken()
      .then(token => {
        const auth = getAuth();
        return signInWithCustomToken(auth, token)
          .then(() => {
            this.firebaseLoginSuccess = true;
          })
          .catch(e => {
            notifyError(e, 'Error signing into Firebase.');
            this.firebaseLoginSuccess = false;
            this.firebaseLoginError = e;
          });
      })
      .catch(e => {
        notifyError(e, 'Error getting Firebase custom token');
        this.firebaseLoginSuccess = false;
        this.firebaseLoginError = e;
      });
  }

  signOutFromFirebase() {
    try {
      const auth = getAuth();
      signOut(auth);
    } catch (e) {
      /* getAuth() will throw an exception when firebase is not initialized.
       * When a user is not in our DB, we immediately log the user out, so firebase
       * would have not been initialized yet.
       */
    }
  }
}

export default FirebaseStore;
