import { IVariantConsequence } from 'app/shared/model/variant-consequence.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/variant-consequences';

export class VariantConsequenceStore extends CrudStore<IVariantConsequence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default VariantConsequenceStore;
