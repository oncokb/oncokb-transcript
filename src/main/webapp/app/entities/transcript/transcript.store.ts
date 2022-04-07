import { ITranscript } from 'app/shared/model/transcript.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/transcripts';

export class TranscriptStore extends PaginationCrudStore<ITranscript> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default TranscriptStore;
