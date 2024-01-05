import { ISequence } from 'app/shared/model/sequence.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class SequenceStore extends PaginationCrudStore<ISequence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.SEQUENCE);
  }
}

export default SequenceStore;
