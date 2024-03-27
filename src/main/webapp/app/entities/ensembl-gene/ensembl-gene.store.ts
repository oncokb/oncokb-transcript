import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class EnsemblGeneStore extends PaginationCrudStore<IEnsemblGene> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ENSEMBL_GENE);
  }
}

export default EnsemblGeneStore;
