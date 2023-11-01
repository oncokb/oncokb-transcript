import { IGene } from 'app/shared/model/gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { transcriptClient } from 'app/shared/api/clients';
import { EnsemblGene } from 'app/shared/api/generated';
import { makeObservable } from 'mobx';

const apiUrl = 'api/genes';
const apiSearchUrl = 'api/genes/search';

export class GeneStore extends PaginationCrudStore<IGene> {
  searchEntities: ICrudSearchAction<IGene> = this.readHandler(this.getSearch);
  ensemblGenes: EnsemblGene[] = [];
  findAllGeneEntities = this.readHandler(this.findAllGene);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);

    makeObservable(this, {});
  }

  *getSearch({ query, page, size, sort }) {
    const result = yield axios.get<IGene[]>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }

  getEnsemblGenes(geneId?: number) {
    const query = geneId ? `?geneId.equals=${geneId}` : '';
    return axios.get<IGene[]>(`api/ensembl-genes${query}`);
  }

  alignTranscripts(transcriptIds: number[]) {
    return transcriptClient.alignTranscripts(transcriptIds);
  }

  *findAllGene(hugoSymbol, page?, size?, sort?) {
    const query = hugoSymbol ? `?query=${hugoSymbol}` : '';
    const result = yield axios.get<IGene[]>(`${apiSearchUrl}${query}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default GeneStore;
