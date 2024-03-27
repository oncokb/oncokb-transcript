import { IEligibilityCriteria } from 'app/shared/model/eligibility-criteria.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class EligibilityCriteriaStore extends PaginationCrudStore<IEligibilityCriteria> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ELIGIBILITY_CRITERIA);
  }
}

export default EligibilityCriteriaStore;
