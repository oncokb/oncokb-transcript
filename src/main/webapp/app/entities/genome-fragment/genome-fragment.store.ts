import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class GenomeFragmentStore extends PaginationCrudStore<IGenomeFragment> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.GENOME_FRAGMENT);
  }
}

export default GenomeFragmentStore;
