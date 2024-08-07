import { IFlag } from 'app/shared/model/flag.model';
import { IRootStore } from 'app/stores';
import { action, makeObservable, observable } from 'mobx';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import axios, { AxiosResponse } from 'axios';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { FlagTypeEnum } from 'app/shared/model/enumerations/flag-type.enum.model';

export class FlagStore extends PaginationCrudStore<IFlag> {
  public oncokbGeneEntity: IFlag | null = null;
  public alterationCategoryFlags: IFlag[] = [];
  getOncokbEntity = this.readHandler(this.getOncokbGeneFlag);
  getFlagsByType = this.readHandler(this.getFlagsByTypeGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.FLAG);
    makeObservable(this, {
      oncokbGeneEntity: observable,
      alterationCategoryFlags: observable,
      getOncokbEntity: action,
      getFlagsByType: action,
    });
  }

  *getOncokbGeneFlag() {
    const result: AxiosResponse<IFlag[]> = yield axios.get<IFlag[]>(`${getEntityResourcePath(ENTITY_TYPE.FLAG)}?flag.equals=ONCOKB`);
    const geneEntities = result.data.filter(flag => flag.type === 'GENE');
    if (geneEntities.length > 0) {
      this.oncokbGeneEntity = geneEntities[0];
    }
    return result;
  }

  *getFlagsByTypeGen(type: FlagTypeEnum) {
    const result: AxiosResponse<IFlag[]> = yield axios.get<IFlag[]>(`${getEntityResourcePath(ENTITY_TYPE.FLAG)}?type.equals=${type}`);
    if (type === FlagTypeEnum.ALTERATION_CATEGORY) {
      this.alterationCategoryFlags = result.data;
    }
    return result.data;
  }
}

export default FlagStore;
