import { ISynonym } from 'app/shared/model/synonym.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class SynonymStore extends PaginationCrudStore<ISynonym> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.SYNONYM);
  }
}

export default SynonymStore;
