import { IHistory } from 'app/shared/model/history.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class HistoryStore extends PaginationCrudStore<IHistory> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.HISTORY);
  }
}

export default HistoryStore;
