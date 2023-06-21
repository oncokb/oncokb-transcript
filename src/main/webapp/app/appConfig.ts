type FrontendProperties = {
  firebase: FirebaseProperties;
};

export type FirebaseProperties = {
  apiKey: string;
  authDomain: string;
  databaseUrl: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

type ServerConfig = {
  frontend: FrontendProperties;
};

interface IAppConfig {
  serverConfig: ServerConfig;
}

export const AppConfig: IAppConfig = {
  serverConfig: (window as any).serverConfig || {},
};
