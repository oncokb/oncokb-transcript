import { action, makeObservable, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores/createStore';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { UserCredential, getAuth, signInWithCustomToken } from 'firebase/auth';
import { AppConfig } from 'app/appConfig';

export class FirebaseStore extends BaseStore {
  public firebaseOptions: FirebaseOptions | undefined = undefined;
  public firebaseApp: FirebaseApp | undefined = undefined;
  public firebaseDb: Database | undefined = undefined;
  public firebaseCustomToken = '';
  public firebaseInitSuccess = false;
  public firebaseInitError: Error | undefined = undefined;

  getFirebaseToken = this.readHandler(this.getFirebaseTokenGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      firebaseOptions: observable,
      firebaseApp: observable,
      firebaseDb: observable,
      firebaseInitSuccess: observable,
      firebaseInitError: observable,
      signInToFirebase: action.bound,
      initializeFirebase: action.bound,
      getFirebaseToken: action.bound,
    });
  }

  *getFirebaseTokenGen() {
    const result: AxiosResponse = yield axios.get('/api/account/firebase-token');
    this.firebaseCustomToken = result.data;
  }

  initializeFirebase() {
    try {
      this.firebaseOptions = AppConfig.serverConfig.frontend.firebase as FirebaseOptions;
      this.firebaseApp = initializeApp(this.firebaseOptions);
      this.firebaseDb = getDatabase(this.firebaseApp);
    } catch (error) {
      this.firebaseInitError = error;
      notifyError(error, 'Encountered issue initializing Firebase app.');
      this.firebaseInitSuccess = false;
    }
  }

  signInToFirebase() {
    this.getFirebaseToken()
      .then(() => {
        const auth = getAuth();
        signInWithCustomToken(auth, this.firebaseCustomToken)
          .then((userCredential: UserCredential) => {
            this.firebaseInitSuccess = true;
          })
          .catch(e => {
            notifyError(e, 'Error signing into Firebase.');
            this.firebaseInitError = e;
            this.firebaseInitSuccess = false;
          });
      })
      .catch(e => {
        notifyError(e, 'Error fetching Firebase custom token');
        this.firebaseInitError = e;
        this.firebaseInitSuccess = false;
      });
  }
}

export default FirebaseStore;
