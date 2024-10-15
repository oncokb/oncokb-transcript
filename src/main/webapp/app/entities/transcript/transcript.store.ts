import { ITranscript } from 'app/shared/model/transcript.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';
import axios, { AxiosResponse } from 'axios';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { ProteinExonDTO } from 'app/shared/api/generated/curation';

const apiUrl = getEntityResourcePath(ENTITY_TYPE.TRANSCRIPT);

export class TranscriptStore extends PaginationCrudStore<ITranscript> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.TRANSCRIPT);
  }

  *getProteinExons(hugoSymbol: string, referenceGenome = ReferenceGenome.GRCh37) {
    const url = `${apiUrl}/protein-exons?hugoSymbol=${hugoSymbol}&referenceGenome=${referenceGenome}`;
    const result: AxiosResponse<ProteinExonDTO[]> = yield axios.get(url);
    return result.data;
  }
}

export default TranscriptStore;
