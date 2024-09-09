import { observable, makeObservable } from 'mobx';
import { IRootStore } from './createStore';
import axios, { AxiosResponse } from 'axios';
import { ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import BaseStore from 'app/shared/util/base-store';

export type ManagementInfo = {
  git?: Git;
  build?: InfoBuild;
  activeProfiles: string[];
};

type GitCommit = {
  id: { describe: string; abbrev: string };
};

type Git = {
  branch: string;
  commit: GitCommit;
};

type InfoBuild = {
  artifact: string;
  name: string;
  time: string;
  version: string;
  group: string;
};

export class ManagementStore extends BaseStore {
  private managementInfo: ManagementInfo | undefined = undefined;
  public commit: string = '';
  public version: string = '';

  getManagementInfo = this.readHandler(this.getManagementInfoGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      commit: observable,
      version: observable,
    });
  }
  *getManagementInfoGen() {
    if (this.managementInfo) {
      return this.managementInfo;
    } else {
      return yield* this.fetchManagementInfo();
    }
  }

  *fetchManagementInfo() {
    const result: AxiosResponse<ManagementInfo> = yield axios.get(`/management/info`);
    this.managementInfo = result.data;
    if (result.data.git?.commit) {
      this.commit = result.data.git.commit.id.abbrev;
    }
    if (result.data.build?.version) {
      this.version = result.data.build.version.startsWith('v') ? result.data.build.version : `v${result.data.build.version}`;
    }
    return result.data;
  }
}

export default ManagementStore;
