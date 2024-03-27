import { ITranscript } from 'app/shared/model/transcript.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class TranscriptStore extends PaginationCrudStore<ITranscript> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.TRANSCRIPT);
  }
}

export default TranscriptStore;
