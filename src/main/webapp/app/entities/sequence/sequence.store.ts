import { ISequence } from 'app/shared/model/sequence.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/sequences';

export class SequenceStore extends PaginationCrudStore<ISequence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default SequenceStore;
