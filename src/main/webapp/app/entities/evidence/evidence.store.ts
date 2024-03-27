import { IEvidence } from 'app/shared/model/evidence.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class EvidenceStore extends PaginationCrudStore<IEvidence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.EVIDENCE);
  }
}

export default EvidenceStore;
