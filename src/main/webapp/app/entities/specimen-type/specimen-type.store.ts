import { ISpecimenType } from 'app/shared/model/specimen-type.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/specimen-types';

export class SpecimenTypeStore extends CrudStore<ISpecimenType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default SpecimenTypeStore;
