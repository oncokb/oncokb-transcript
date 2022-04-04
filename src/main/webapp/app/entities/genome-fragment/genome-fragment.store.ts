import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/genome-fragments';

export class GenomeFragmentStore extends CrudStore<IGenomeFragment> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default GenomeFragmentStore;
