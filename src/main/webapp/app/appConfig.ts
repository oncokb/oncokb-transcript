type FrontendProperties = {
  firebase: FirebaseProperties;
  sentryDsn: string;
};

export type FirebaseProperties = {
  enabled: boolean;
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
