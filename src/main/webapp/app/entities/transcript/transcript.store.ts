import { ITranscript } from 'app/shared/model/transcript.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/transcripts';

export class TranscriptStore extends CrudStore<ITranscript> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default TranscriptStore;
