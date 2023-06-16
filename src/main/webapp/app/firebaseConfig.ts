import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { AppConfig } from './appConfig';

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

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDB = getDatabase(firebaseApp);
