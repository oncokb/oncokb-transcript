import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';
export class ClinicalTrialStore extends PaginationCrudStore<IClinicalTrial> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.CLINICAL_TRIAL);
  }
}

export default ClinicalTrialStore;
