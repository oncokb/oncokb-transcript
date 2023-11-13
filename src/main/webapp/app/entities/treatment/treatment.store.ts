import { ITreatment } from 'app/shared/model/treatment.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { IGene } from 'app/shared/model/gene.model';
import { ENTITY_TYPE } from 'app/config/constants';

export class TreatmentStore extends PaginationCrudStore<ITreatment> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.TREATMENT);
  }
}

export default TreatmentStore;
