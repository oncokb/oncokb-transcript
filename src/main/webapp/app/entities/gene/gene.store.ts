import { IGene } from 'app/shared/model/gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { transcriptClient } from 'app/shared/api/clients';
import { EnsemblGene } from 'app/shared/api/generated/curation';
import { makeObservable } from 'mobx';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class GeneStore extends PaginationCrudStore<IGene> {
  ensemblGenes: EnsemblGene[] = [];

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.GENE);

    makeObservable(this, {});
  }

  getEnsemblGenes(geneId?: number) {
    const query = geneId ? `?geneId.equals=${geneId}` : '';
    return axios.get<IGene[]>(`api/ensembl-genes${query}`);
  }

  alignTranscripts(transcriptIds: number[]) {
    return transcriptClient.alignTranscripts(transcriptIds);
  }
}

export default GeneStore;
