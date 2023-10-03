import { IAlterationReferenceGenome } from 'app/shared/model/alteration-reference-genome.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/alteration-reference-genomes';

export class AlterationReferenceGenomeStore extends CrudStore<IAlterationReferenceGenome> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default AlterationReferenceGenomeStore;
