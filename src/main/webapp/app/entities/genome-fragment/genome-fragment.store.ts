import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/genome-fragments';

export class GenomeFragmentStore extends PaginationCrudStore<IGenomeFragment> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default GenomeFragmentStore;
