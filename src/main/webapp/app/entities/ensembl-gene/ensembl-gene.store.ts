import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ensemblGeneClient } from 'app/shared/api/clients';

const apiUrl = 'api/ensembl-genes';

export class EnsemblGeneStore extends PaginationCrudStore<IEnsemblGene> {
  searchEntities = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }

  *getSearch({ query, page, size, sort }) {
    const result = yield ensemblGeneClient.searchEnsemblGenes(query, { page, size, sort });
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return this.entities;
  }
}

export default EnsemblGeneStore;
