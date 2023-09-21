import { IFlag } from 'app/shared/model/flag.model';
import { IRootStore } from 'app/stores';
import { action, makeObservable, observable } from 'mobx';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import axios, { AxiosResponse } from 'axios';
import { flagClient } from 'app/shared/api/clients';
import { Flag } from 'app/shared/api/generated';
import { IGene } from 'app/shared/model/gene.model';

const apiUrl = 'api/flags';
const oncokbEntityId = 6;

export class FlagStore extends PaginationCrudStore<IFlag> {
  public oncokbGeneEntity = null;
  getOncokbEntity = this.readHandler(this.getOncokbGeneFlag);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
    makeObservable(this, {
      oncokbGeneEntity: observable,
      getOncokbEntity: action,
    });
  }

  *getOncokbGeneFlag() {
    const result: AxiosResponse<IFlag[]> = yield axios.get<IFlag[]>('api/flags?flag.equals=ONCOKB');
    const geneEntities = result.data.filter(flag => flag.type === 'GENE');
    if (geneEntities.length > 0) {
      this.oncokbGeneEntity = geneEntities[0];
    }
    return result;
  }
}

export default FlagStore;
