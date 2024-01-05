import { IClinicalTrialArm } from 'app/shared/model/clinical-trial-arm.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class ClinicalTrialArmStore extends PaginationCrudStore<IClinicalTrialArm> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.CLINICAL_TRIAL_ARM);
  }
}

export default ClinicalTrialArmStore;
