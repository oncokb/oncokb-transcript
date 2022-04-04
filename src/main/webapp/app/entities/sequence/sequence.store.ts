import { ISequence } from 'app/shared/model/sequence.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/sequences';

export class SequenceStore extends CrudStore<ISequence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default SequenceStore;
