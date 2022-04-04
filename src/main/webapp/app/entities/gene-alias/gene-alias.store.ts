import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/gene-aliases';

export class GeneAliasStore extends CrudStore<IGeneAlias> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default GeneAliasStore;
