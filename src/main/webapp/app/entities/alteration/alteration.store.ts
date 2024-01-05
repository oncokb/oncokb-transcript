import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { Alteration } from 'app/shared/api/generated';
import { alterationClient, alterationControllerClient } from 'app/shared/api/clients';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class AlterationStore extends PaginationCrudStore<IAlteration> {
  public proteinChangeAlteration: IAlteration;

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ALTERATION);
  }

  *annotateAlteration({ geneIds, alteration }) {
    const alt = {
      genes: geneIds.map(id => ({ id })),
      alteration,
    };
    const result = yield alterationControllerClient.annotateAlteration(alt as Alteration);
    this.proteinChangeAlteration = result.data;
    return this.proteinChangeAlteration;
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
