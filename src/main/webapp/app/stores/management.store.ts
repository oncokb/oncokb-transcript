import { observable, makeObservable } from 'mobx';
import { IRootStore } from './createStore';
import axios, { AxiosResponse } from 'axios';

export type ManagementInfo = {
  git?: GitCommit;
  build?: InfoBuild;
};

type GitCommit = {
  branch: string;
  commit: string;
};

type InfoBuild = {
  artifact: string;
  name: string;
  time: string;
  version: string;
  group: string;
};

export class ManagementStore {
  public commit: string = '';
  public version: string = '';

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      commit: observable,
      version: observable,
    });
  }

  *fetchManagementInfo() {
    const result: AxiosResponse<ManagementInfo> = yield axios.get(`/management/info`);
    if (result.data.git?.commit) {
      this.commit = result.data.git.commit;
    }
    if (result.data.build?.version) {
      this.version = result.data.build.version.startsWith('v') ? result.data.build.version : `v${result.data.build.version}`;
    }
    return result;
  }
}

export default ManagementStore;
