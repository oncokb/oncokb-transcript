import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class NciThesaurusStore extends PaginationCrudStore<INciThesaurus> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.NCI_THESAURUS);
  }
}

export default NciThesaurusStore;
