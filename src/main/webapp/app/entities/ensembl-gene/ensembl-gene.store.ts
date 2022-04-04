import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/ensembl-genes';

export class EnsemblGeneStore extends CrudStore<IEnsemblGene> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default EnsemblGeneStore;
