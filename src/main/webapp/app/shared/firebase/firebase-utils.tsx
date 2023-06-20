import { AppConfig } from 'app/appConfig';
import { initializeApp } from 'firebase/app';

export const initializeFirebase = () => {
  const firebaseConfig = {
    apiKey: AppConfig.serverConfig.frontend.firebase.apiKey,
    authDomain: AppConfig.serverConfig.frontend.firebase.authDomain,
    databaseURL: AppConfig.serverConfig.frontend.firebase.databaseUrl,
    projectId: AppConfig.serverConfig.frontend.firebase.projectId,
    storageBucket: AppConfig.serverConfig.frontend.firebase.storageBucket,
    messagingSenderId: AppConfig.serverConfig.frontend.firebase.messagingSenderId,
    appId: AppConfig.serverConfig.frontend.firebase.appId,
    measurementId: AppConfig.serverConfig.frontend.firebase.measurementId,
  };
  const firebaseApp = initializeApp(firebaseConfig);
  return firebaseApp;
};
