import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { AnnotateAlterationBody } from 'app/shared/api/generated/curation';
import { alterationClient, alterationControllerClient } from 'app/shared/api/clients';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class AlterationStore extends PaginationCrudStore<IAlteration> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ALTERATION);
  }

  *annotateAlterations(altsToBeAnnotated: AnnotateAlterationBody[]) {
    const result = yield alterationControllerClient.annotateAlterations(altsToBeAnnotated);
    return result.data;
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
