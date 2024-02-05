import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { Alteration, EntityStatusAlteration } from 'app/shared/api/generated';
import { alterationClient, alterationControllerClient } from 'app/shared/api/clients';
import { ENTITY_TYPE } from 'app/config/constants/constants';

/* eslint-disable no-console */
export class AlterationStore extends PaginationCrudStore<IAlteration> {
  public proteinChangeAlteration: IAlteration;

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ALTERATION);
  }

  *annotateAlteration({ geneIds, alteration }, updateStore = true) {
    const alt = {
      genes: geneIds.map(id => ({ id })),
      alteration,
    };
    const result = yield alterationControllerClient.annotateAlteration(alt as Alteration);
    const data = result.data;
    if (updateStore) {
      this.proteinChangeAlteration = data.entity;
    }
    return data as EntityStatusAlteration;
  }

  *getAlterationsByGeneId({ geneId }) {
    if (geneId) {
      const result = yield alterationClient.findByGeneId(geneId);
      return result.data;
    }
    return [];
  }
}

export default AlterationStore;
