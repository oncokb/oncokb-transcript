import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/ensembl-genes';

export class EnsemblGeneStore extends PaginationCrudStore<IEnsemblGene> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default EnsemblGeneStore;
